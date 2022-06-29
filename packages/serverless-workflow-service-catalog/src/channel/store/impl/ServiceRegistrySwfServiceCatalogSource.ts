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

import { SwfServiceCatalogSource } from "../SwfServiceCatalogSource";

import {
  SwfServiceCatalogFunctionSourceType,
  SwfServiceCatalogService,
  SwfServiceCatalogServiceSourceType,
  SwfServiceCatalogServiceType,
} from "../../../api";
import { AuthProvider } from "../auth";
import { ArtifactsApi, ArtifactType, Configuration, SearchedArtifact } from "@rhoas/registry-instance-sdk";
import { OpenAPIV3 } from "openapi-types";
import * as yaml from "js-yaml";
import { extractFunctions } from "../../parsers/openapi";

export class ServiceRegistrySwfServiceCatalogSource implements SwfServiceCatalogSource {
  constructor(
    private readonly args: {
      name: string;
      url: string;
      authProvider: AuthProvider;
    }
  ) {}

  public get name() {
    return this.args.name;
  }

  public get authProvider() {
    return this.args.authProvider;
  }

  public async getSwfCatalogServices(): Promise<SwfServiceCatalogService[]> {
    const headers = await this.args.authProvider.getAuthHeader();

    const artifactsApi: ArtifactsApi = new ArtifactsApi(
      new Configuration({
        basePath: this.args.url,
        baseOptions: {
          headers,
        },
      })
    );

    const swfServices: SwfServiceCatalogService[] = [];

    try {
      const response = await artifactsApi.searchArtifacts();
      const artifacts: SearchedArtifact[] = response.data.artifacts ?? [];
      const specs: SearchedArtifact[] = artifacts.filter(
        (artifact) => artifact.type === ArtifactType.Openapi && artifact.groupId
      );

      for (const spec of specs) {
        const response = await artifactsApi.getLatestArtifact(spec.groupId ?? "", spec.id);

        const swfFunctions = extractFunctions(response.data as OpenAPIV3.Document, {
          type: SwfServiceCatalogFunctionSourceType.SERVICE_REGISTRY,
          registry: this.name,
          serviceId: spec.id,
        });

        const swfService: SwfServiceCatalogService = {
          name: spec.id,
          rawContent: yaml.dump(response.data),
          type: SwfServiceCatalogServiceType.rest,
          functions: swfFunctions,
          source: {
            registry: this.name,
            url: `${this.args.url}/groups/${spec.groupId}/artifacts/${spec.id}`,
            type: SwfServiceCatalogServiceSourceType.SERVICE_REGISTRY,
            id: spec.id,
          },
        };

        swfServices.push(swfService);
      }
    } catch (err) {
      console.log(`Cannot load services: ${err}`);
    }

    return Promise.resolve(swfServices);
  }

  public dispose(): void {
    this.args.authProvider.dispose();
  }
}
