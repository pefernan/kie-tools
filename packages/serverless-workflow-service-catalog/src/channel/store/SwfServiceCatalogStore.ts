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

import { SwfServiceCatalogSource } from "./SwfServiceCatalogSource";
import { SwfServiceCatalogSourcesProvider } from "./SwfServiceCatalogSourcesProvider";
import { Disposable } from "./types";
import { AuthProvider } from "./auth";
import { SwfServiceCatalogService } from "../../api";

export class SwfServiceCatalogStore {
  private subscriptions: Set<(services: SwfServiceCatalogService[]) => Promise<any>> = new Set();
  private catalogSourcesStore: Map<SwfServiceCatalogSource, SwfServiceCatalogService[]> = new Map();

  constructor(
    private args: {
      sourceProvider: SwfServiceCatalogSourcesProvider;
    }
  ) {
    this.args.sourceProvider.subscribeToCatalogSourceChange((sources) => this.initSources(sources));
  }

  public get services() {
    return [...this.catalogSourcesStore.values()].flat();
  }

  public get isConfigured() {
    return this.catalogSourcesStore.size > 0;
  }

  public get authProviders() {
    const result: AuthProvider[] = [];

    Array.from(this.catalogSourcesStore.keys()).forEach((source) => {
      if (source.authProvider) {
        result.push(source.authProvider);
      }
    });

    return result;
  }

  public init(): Promise<void> {
    return this.initSources(this.args.sourceProvider.getCatalogSources());
  }

  public getSwfCatalogServices(): Promise<SwfServiceCatalogService[]> {
    return Promise.resolve([...this.catalogSourcesStore.values()].flat());
  }

  public async refresh(): Promise<void> {
    const catalogSources = Array.from(this.catalogSourcesStore.keys());
    const promises = catalogSources.map((source) => source.getSwfCatalogServices());

    await Promise.all(promises).then((result) => {
      result.forEach((swfServices, index) => {
        this.catalogSourcesStore.set(catalogSources[index], swfServices);
      });
    });

    this.notifyRefresh();
    return Promise.resolve();
  }

  public subscribeToCatalogChanges(subscription: (services: SwfServiceCatalogService[]) => Promise<any>): Disposable {
    this.subscriptions.add(subscription);
    return {
      dispose: () => {
        this.subscriptions.delete(subscription);
      },
    };
  }

  public dispose() {
    this.subscriptions.clear();
    this.clearSources();
  }

  private initSources(sources: SwfServiceCatalogSource[]): Promise<void> {
    this.clearSources();

    sources.forEach((source) => {
      this.catalogSourcesStore.set(source, []);
      source.authProvider.subscribeToSessionChange(() => this.refreshSourceStore(source));
    });

    return this.refresh();
  }

  private clearSources() {
    Array.from(this.catalogSourcesStore.keys()).forEach((source) => source.dispose());

    this.catalogSourcesStore.clear();
  }

  private async refreshSourceStore(catalogSource: SwfServiceCatalogSource) {
    const services = await catalogSource.getSwfCatalogServices();
    this.catalogSourcesStore.set(catalogSource, services);
    this.notifyRefresh();
  }

  private notifyRefresh() {
    this.subscriptions.forEach((subscription) => subscription(this.services));
  }
}
