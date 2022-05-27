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

import {
  SwfServiceCatalogFunction,
  SwfServiceCatalogFunctionSourceType,
  SwfServiceCatalogService,
  SwfServiceCatalogServiceSourceType,
  SwfServiceCatalogServiceType,
} from "@kie-tools/serverless-workflow-service-catalog/dist/api";
import { RhhccAuthenticationStore } from "../../rhhcc/RhhccAuthenticationStore";
import axios from "axios";
import { OpenAPIV3 } from "openapi-types";
import { extractFunctions } from "@kie-tools/serverless-workflow-service-catalog/dist/channel/parsers/openapi";
import { CONFIGURATION_SECTIONS, SwfVsCodeExtensionConfiguration } from "../../configuration";
import * as vscode from "vscode";
import * as yaml from "yaml";
import { getServiceFileNameFromSwfServiceCatalogServiceId } from "./index";
import { getServiceRegistryRestApi, getSwfServiceCatalogServices } from "../apicurio";

export class RhhccServiceRegistryServiceCatalogStore {
  private subscriptions: Set<(services: SwfServiceCatalogService[]) => Promise<any>> = new Set();
  private urlVsPathConfigurationChangeCallback: vscode.Disposable;
  private specsStoragePathConfigurationChangeCallback: vscode.Disposable;
  private serviceRegistryUrlConfigurationChangeCallback: vscode.Disposable;

  constructor(
    private readonly args: {
      rhhccAuthenticationStore: RhhccAuthenticationStore;
      configuration: SwfVsCodeExtensionConfiguration;
    }
  ) {}

  public async init() {
    this.urlVsPathConfigurationChangeCallback = vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration(CONFIGURATION_SECTIONS.shouldReferenceServiceRegistryFunctionsWithUrls)) {
        return this.refresh();
      }
    });

    this.specsStoragePathConfigurationChangeCallback = vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration(CONFIGURATION_SECTIONS.specsStoragePath)) {
        return this.refresh();
      }
    });

    this.serviceRegistryUrlConfigurationChangeCallback = vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration(CONFIGURATION_SECTIONS.serviceRegistryUrl)) {
        return this.refresh();
      }
    });

    return this.refresh();
  }

  public subscribeToNewServices(subs: (services: SwfServiceCatalogService[]) => Promise<any>) {
    this.subscriptions.add(subs);
    return new vscode.Disposable(() => {
      this.unsubscribeToNewServices(subs);
    });
  }

  public unsubscribeToNewServices(subs: (services: SwfServiceCatalogService[]) => Promise<any>) {
    this.subscriptions.delete(subs);
  }

  public async refresh() {
    const serviceRegistryUrl = this.args.configuration.getConfiguredServiceRegistryUrl();

    if (!this.args.rhhccAuthenticationStore.session) {
      return Promise.all(Array.from(this.subscriptions).map((subscription) => subscription([])));
    }

    if (!serviceRegistryUrl) {
      return Promise.all(Array.from(this.subscriptions).map((subscription) => subscription([])));
    }

    const services: SwfServiceCatalogService[] = await getSwfServiceCatalogServices(
      serviceRegistryUrl,
      this.args.rhhccAuthenticationStore.session.accessToken
    );

    return Promise.all(Array.from(this.subscriptions).map((subscription) => subscription(services)));
  }

  public dispose() {
    this.urlVsPathConfigurationChangeCallback?.dispose();
    this.specsStoragePathConfigurationChangeCallback?.dispose();
    this.serviceRegistryUrlConfigurationChangeCallback?.dispose();
  }
}

export interface ServiceRegistryArtifactSearchResponse {
  artifacts: ServiceRegistryArtifactMetadata[];
}

export interface ServiceRegistryArtifactMetadata {
  groupId: string;
  id: string;
  type: string;
}
