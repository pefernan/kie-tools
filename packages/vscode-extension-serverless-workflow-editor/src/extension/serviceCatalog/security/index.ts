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
import { Issuer, generators, TokenSet, Client } from "openid-client";
import { exec } from "child_process";
import { getSwfServiceCatalogServices } from "../apicurio";

//const URL = "http://192.168.1.167:8480/auth/realms/registry/.well-known/openid-configuration";
const URL = "http://192.168.1.43:8480/auth/realms/registry/.well-known/openid-configuration";
const redirectUri = "vscode://redhat.vscode-extension-serverless-workflow-editor";
let nonce: string;
let client: Client;

export const doOpenIdLogin = async () => {
  console.log("openid login: ", URL);
  const issuer = await Issuer.discover(URL);

  console.log("openid issuer", issuer);

  client = new issuer.Client({
    client_id: "vscode-extension",
    redirect_uris: [redirectUri],
    response_types: ["code"],
  });
  nonce = generators.nonce();

  console.log("openid client", client);

  const req = client.authorizationUrl({
    client_id: "vscode-extension",
    scope: "openid",
    response_type: "code",
    response_mode: "fragment",
    redirect_uri: redirectUri,
    nonce,
  });

  console.log("openid request", req);
  //This opens browser window from vscode and user gets logged in and comes back to extension
  vscode.env.openExternal(vscode.Uri.parse(req)).then((response) => {
    console.log("Signin response: ", response); // returns true
    // not sure how to proceed here
  });
};

export const onOpenIdCallback = async (uri: vscode.Uri) => {
  console.log("oncallback uri: ", uri);

  const params = client.callbackParams(uri.toString(false));

  console.log("oncallback params: ", params);
  const tokenSet = await client.callback(redirectUri, params, {
    code_verifier: generators.codeVerifier(),
    nonce,
  });

  console.log("oncallback tokens: ", tokenSet);

  const services = getSwfServiceCatalogServices("http://192.168.1.43:8080/apis/registry/v2", tokenSet.access_token);
  console.log("oncallback services: ", services);
};
