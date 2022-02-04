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

import { FunctionType, ServiceCatalogApi, ServiceDefinition, ServiceType } from "../api";
import * as vscode from "vscode";

export class VsCodeServiceCatalogApi implements ServiceCatalogApi {
  constructor() {}

  kogitoServiceCatalog_getServiceCatalog(): Promise<ServiceDefinition[]> {
    vscode.window.showInformationMessage("Requesting services");
    return Promise.resolve([
      {
        name: "service",
        id: "specs/service.yaml",
        type: ServiceType.rest,
        functions: [
          {
            name: "f1",
            type: FunctionType.rest,
            arguments: {},
            operation: "specs/service.yaml#f1",
          },
          {
            name: "f2",
            type: FunctionType.rest,
            arguments: {},
            operation: "specs/service.yaml#f1",
          },
        ],
      },
    ]);
  }
}
