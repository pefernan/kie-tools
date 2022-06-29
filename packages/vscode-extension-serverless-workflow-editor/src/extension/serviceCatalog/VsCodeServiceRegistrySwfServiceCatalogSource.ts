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

import { Disposable, SwfServiceCatalogSource } from "@kie-tools/serverless-workflow-service-catalog/dist/channel/store";
import { ServiceRegistryInstanceClient } from "./serviceRegistry/ServiceRegistryInstanceClient";
import { SwfServiceCatalogService } from "@kie-tools/serverless-workflow-service-catalog/dist/api";
import * as vscode from "vscode";

export class VsCodeServiceRegistrySwfServiceCatalogSource implements SwfServiceCatalogSource {
  private readonly subscriptions: Set<(services: SwfServiceCatalogService[]) => void> = new Set();
  private disposable: Disposable;

  constructor(
    private readonly args: {
      client: ServiceRegistryInstanceClient;
    }
  ) {
    this.disposable = this.args.client.authProvider.subscribeToSessionChange(() => this.notifyChange());
  }

  public get name() {
    return this.args.client.name;
  }

  public async getSwfCatalogServices(): Promise<SwfServiceCatalogService[]> {
    return this.args.client.getSwfServiceCatalogServices();
  }

  public dispose(): void {
    this.disposable?.dispose();
    this.subscriptions.clear();
  }

  public needsAuth(): Promise<boolean> {
    return Promise.resolve(this.args.client.authProvider.shouldLogin());
  }

  subscribeToChange(subscription: (services: SwfServiceCatalogService[]) => void): Disposable {
    this.subscriptions.add(subscription);
    return new vscode.Disposable(() => {
      this.subscriptions.delete(subscription);
    });
  }

  private async notifyChange() {
    const services = await this.args.client.getSwfServiceCatalogServices();
    this.subscriptions.forEach((subscription) => subscription(services));
  }
}
