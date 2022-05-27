/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ArtifactsApi, ArtifactType, Configuration, SearchedArtifact } from "@rhoas/registry-instance-sdk";
import { SwfServiceCatalogService } from "@kie-tools/serverless-workflow-service-catalog/src/api/types";
import {
  SwfServiceCatalogFunctionSourceType,
  SwfServiceCatalogServiceSourceType,
  SwfServiceCatalogServiceType,
} from "@kie-tools/serverless-workflow-service-catalog/dist/api";
import { getServiceFileNameFromSwfServiceCatalogServiceId } from "../rhhccServiceRegistry";
import { extractFunctions } from "@kie-tools/serverless-workflow-service-catalog/dist/channel/parsers/openapi";
import { OpenAPIV3 } from "openapi-types";

export const getSwfServiceCatalogServices = async (
  serviceRegistryUrl: string,
  token?: string
): Promise<SwfServiceCatalogService[]> => {
  return new Promise((resolve) => {
    requestSwfServiceCatalogServices(serviceRegistryUrl, resolve, token);
  });
};

const requestSwfServiceCatalogServices = async (
  serviceRegistryUrl: string,
  consumer: (services: SwfServiceCatalogService[]) => void,
  token?: string
) => {
  console.log("loading services: ", serviceRegistryUrl, token);

  const artifactsApi: ArtifactsApi = new ArtifactsApi(
    new Configuration({
      apiKey: token,
      accessToken: token,
      basePath: serviceRegistryUrl,
      baseOptions: {
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    })
  );

  const swfServices: SwfServiceCatalogService[] = [];
  try {
    const response = await artifactsApi.searchArtifacts();
    const artifacts: SearchedArtifact[] = response.data.artifacts ?? [];
    console.log("artifacts", artifacts);
    const specs: SearchedArtifact[] = artifacts.filter((artifact) => artifact.type === ArtifactType.Openapi);
    console.log("specs", specs);
    for (const spec of specs) {
      console.log("spec:", spec.id);

      const response = await artifactsApi.getLatestArtifact(spec.groupId ?? "", spec.id);
      console.log(response);
      const swfFunctions = extractFunctions(response.data as OpenAPIV3.Document, {
        type: SwfServiceCatalogFunctionSourceType.RHHCC_SERVICE_REGISTRY,
        serviceId: spec.id,
      });
      const swfService: SwfServiceCatalogService = {
        name: getServiceFileNameFromSwfServiceCatalogServiceId(spec.id),
        rawContent: response.data,
        type: SwfServiceCatalogServiceType.rest,
        functions: swfFunctions,
        source: {
          url: `${serviceRegistryUrl}/groups/${spec.groupId}/artifacts/${spec.id}`,
          type: SwfServiceCatalogServiceSourceType.RHHCC_SERVICE_REGISTRY,
          id: spec.id,
        },
      };

      swfServices.push(swfService);
      console.log(swfServices.length);
    }
  } catch (err) {
    console.log(`Cannot load services: ${err}`);
  }
  consumer(swfServices);
};

export const getServiceRegistryRestApi = (serviceRegistryUrl: string, token?: string) => ({
  getArtifactContentUrl: (params: { groupId: string; id: string }) => {
    return `${serviceRegistryUrl}/groups/${params.groupId}/artifacts/${params.id}`;
  },
  getArtifactsUrl: () => {
    return `${serviceRegistryUrl}/search/artifacts`;
  },
});
