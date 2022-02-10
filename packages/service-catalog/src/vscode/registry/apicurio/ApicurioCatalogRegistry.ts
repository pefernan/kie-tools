/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ServiceCatalogRegistry } from "../ServiceCatalogRegistry";
import { FunctionDefinition, ServiceDefinition } from "../../../api";
import { loadOpenAPIService } from "../parsers";
import { ArtifactsApi, ArtifactState, ArtifactType, Configuration } from "@rhoas/registry-instance-sdk";

const APICURIO_APIS = "apis/registry/v2";

export class ApicurioCatalogRegistry implements ServiceCatalogRegistry {
  private readonly apicurioClientApi: ArtifactsApi;
  private registry: Map<ServiceDefinition, FunctionDefinition[]> = new Map<ServiceDefinition, FunctionDefinition[]>();

  constructor(
    apicurioRegistryUrl: string,
    private readonly baseSpecsPath: string,
    private readonly storagePath: string
  ) {
    if (!apicurioRegistryUrl.endsWith(APICURIO_APIS)) {
      apicurioRegistryUrl += apicurioRegistryUrl.endsWith("/") ? APICURIO_APIS : `/${APICURIO_APIS}`;
    }

    console.log("ApicurioCatalogRegistry init ", apicurioRegistryUrl);

    const apiConfig = new Configuration({
      basePath: apicurioRegistryUrl,
    });

    this.apicurioClientApi = new ArtifactsApi(apiConfig);

    this.load();
  }

  getFunctions(serviceId?: string): Promise<FunctionDefinition[]> {
    const result: FunctionDefinition[] = [];

    this.registry.forEach((functions, service) => {
      if (!serviceId || (serviceId && service.id === serviceId)) {
        result.push(...functions);
      }
    });
    return Promise.resolve(result);
  }

  public getServiceCatalog(): Promise<ServiceDefinition[]> {
    return Promise.resolve(Array.from(this.registry.keys()));
  }

  public persistService(serviceId: string): void {}

  private async load() {
    console.log("ApicurioCatalogRegistry load ");
    this.apicurioClientApi
      .searchArtifacts()
      .then((response) => {
        console.log("ApicurioCatalogRegistry then ", response);
        response.data.artifacts
          .filter((artifact) => artifact.type === ArtifactType.Openapi && artifact.state === ArtifactState.Enabled)
          .forEach((artifact) => {
            console.log("ApicurioCatalogRegistry get content ", artifact.groupId, artifact.id);
            this.apicurioClientApi
              .getLatestArtifact(artifact.groupId ?? "", artifact.id)
              .then((content) => {
                console.log(content);
                try {
                  loadOpenAPIService({
                    fileName: `${artifact.id.trim().replace(" ", "_")}.yml`,
                    storagePath: this.baseSpecsPath,
                    content: JSON.stringify(content.data),
                    consumer: (serviceDef, functions) => {
                      this.registry.set(serviceDef, functions);
                    },
                  });
                } catch (err) {
                  console.log("parse error", err);
                }
              })
              .catch((err) => console.log("content error", err));
          });
      })
      .catch((err) => {
        console.log("artifacts error", err);
        console.trace(err);
      });
  }
}
