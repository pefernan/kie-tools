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

import {
  SwfServiceCatalogFunction,
  SwfServiceCatalogService,
} from "@kie-tools/serverless-workflow-service-catalog/dist/api";

interface SwfServiceCatalogApi {
  getServices(): SwfServiceCatalogService[];
  getFunctions(serviceId?: string): SwfServiceCatalogFunction[];
  getFunctionByOperation(operationId: string): SwfServiceCatalogFunction | undefined;
}

class SwfServiceCatalogApiImpl implements SwfServiceCatalogApi {
  constructor(private readonly services: SwfServiceCatalogService[] = []) {}

  public getFunctionByOperation(operationId: string): SwfServiceCatalogFunction | undefined {
    for (const swfService of this.services) {
      for (const swfFunction of swfService.functions) {
        if (swfFunction.operation === operationId) {
          return swfFunction;
        }
      }
    }

    return undefined;
  }

  public getFunctions(serviceId?: string): SwfServiceCatalogFunction[] {
    const result: SwfServiceCatalogFunction[] = [];

    this.services.forEach((service) => {
      if (!serviceId || (serviceId && service.id === serviceId)) {
        result.push(...service.functions);
      }
    });
    return result;
  }

  public getServices(): SwfServiceCatalogService[] {
    return this.services;
  }
}

export class SwfServiceCatalogSingleton {
  private static instance = new SwfServiceCatalogApiImpl();

  public static get(): SwfServiceCatalogApi {
    return SwfServiceCatalogSingleton.instance;
  }

  public static init(services: SwfServiceCatalogService[] = []) {
    SwfServiceCatalogSingleton.instance = new SwfServiceCatalogApiImpl(services);
  }
}
