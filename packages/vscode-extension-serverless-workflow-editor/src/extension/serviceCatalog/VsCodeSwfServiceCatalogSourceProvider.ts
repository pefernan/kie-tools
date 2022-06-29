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

import { CONFIGURATION_SECTIONS, SwfVsCodeExtensionConfiguration } from "../configuration";
import * as vscode from "vscode";
import { Disposable } from "@vscode/test-web";
import { lookupAuthProvider } from "./serviceRegistry/auth";
import {
  SwfServiceCatalogSource,
  SwfServiceCatalogSourcesProvider,
} from "@kie-tools/serverless-workflow-service-catalog/dist/channel/store";
import { ServiceRegistrySwfServiceCatalogSource } from "@kie-tools/serverless-workflow-service-catalog/dist/channel/store/impl";
import { VsCodeFsSwfServiceCatalogSource } from "./fs";

export class VsCodeSwfServiceCatalogSourceProvider implements SwfServiceCatalogSourcesProvider {
  private readonly subscriptions: Set<(sources: SwfServiceCatalogSource[]) => void> = new Set();
  private readonly sources: Set<SwfServiceCatalogSource> = new Set();

  constructor(
    private readonly args: {
      configuration: SwfVsCodeExtensionConfiguration;
      context: vscode.ExtensionContext;
    }
  ) {
    args.context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(CONFIGURATION_SECTIONS.serviceRegistriesSettings)) {
          this.refreshSources();
        }
      })
    );
    args.context.subscriptions.push(new vscode.Disposable(() => this.dispose()));
    this.init();
  }

  getCatalogSources(): SwfServiceCatalogSource[] {
    return Array.from(this.sources);
  }

  subscribeToCatalogSourceChange(subscription: (sources: SwfServiceCatalogSource[]) => void): Disposable {
    this.subscriptions.add(subscription);
    return {
      dispose: () => {
        this.subscriptions.delete(subscription);
      },
    };
  }

  public dispose() {
    this.getCatalogSources().forEach((source) => source.dispose());
    this.sources.clear();
  }

  private init(): void {
    this.dispose();

    const registrySettings = this.args.configuration.getServiceRegistrySettings();

    registrySettings?.registries?.forEach((clientSettings) => {
      try {
        const authProvider = lookupAuthProvider({
          settings: clientSettings,
          context: this.args.context,
        });

        const source = new ServiceRegistrySwfServiceCatalogSource({
          name: clientSettings.name,
          url: clientSettings.url,
          authProvider,
        });

        this.sources.add(source);
      } catch (err) {
        console.log("Couldn't create Service Registry client for: ", clientSettings, err);
      }
    });
  }

  private refreshSources() {
    this.init();
    Array.from(this.subscriptions).forEach((subscription) => subscription(this.getCatalogSources()));
  }
}
