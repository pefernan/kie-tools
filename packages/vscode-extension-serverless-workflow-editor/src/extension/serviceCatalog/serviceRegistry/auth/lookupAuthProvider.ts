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

import * as vscode from "vscode";
import { AuthProvider } from "./AuthProvider";
import { RHCCAuthProvider } from "./RHCCAuthProvider";
import { AuthProviderType } from "@kie-tools/serverless-workflow-service-catalog/dist/api";

export const lookupAuthProvider = (args: {
  context: vscode.ExtensionContext;
  settings: {
    authProvider: AuthProviderType;
    authUrl?: string;
    clientId?: string;
  };
}): AuthProvider | undefined => {
  if (args.settings && args.settings.authProvider === AuthProviderType.RH_ACCOUNT) {
    return new RHCCAuthProvider(args.context);
  }
  return undefined;
};
