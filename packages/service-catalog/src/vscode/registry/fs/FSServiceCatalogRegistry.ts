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
import * as vscode from "vscode";
import { FileType } from "vscode";

const OPENAPI_EXTENSIONS_REGEX = new RegExp("^.*\\.(yaml|yml|json)$");

export class FSServiceCatalogRegistry implements ServiceCatalogRegistry {
  private registry: Map<ServiceDefinition, FunctionDefinition[]> = new Map<ServiceDefinition, FunctionDefinition[]>();

  constructor(private readonly baseSpecsPath: string, private readonly storagePath: string) {
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
    const specsUri = vscode.Uri.parse(this.storagePath);

    const stats = await vscode.workspace.fs.stat(specsUri);

    if (!stats || stats.type !== FileType.Directory) {
      throw new Error(`Invalid path: ${this.storagePath}`);
    }

    const files = await vscode.workspace.fs.readDirectory(specsUri);

    files.forEach(([fileName, type]) => {
      if (type === FileType.File && OPENAPI_EXTENSIONS_REGEX.test(fileName.toLowerCase())) {
        vscode.workspace.fs
          .readFile(
            specsUri.with({
              path: this.storagePath + "/" + fileName,
            })
          )
          .then((data) => {
            const content = Buffer.from(data).toString("utf-8");
            loadOpenAPIService({
              fileName: fileName,
              storagePath: this.baseSpecsPath,
              content: content,
              consumer: (serviceDef, functions) => {
                this.registry.set(serviceDef, functions);
              },
            });
          });
      }
    });
  }
}
