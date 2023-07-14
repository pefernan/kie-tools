/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { startServer } from "./proxy";

function getPort(): number {
  if (process.env.CORS_PROXY_HTTP_PORT) {
    const port = Number(process.env.CORS_PROXY_HTTP_PORT);
    if (!isNaN(port)) {
      return port;
    }
  }
  return 8080;
}

export const run = () => {
  startServer({
    port: getPort(),
    origin: process.env.CORS_PROXY_ORIGIN ?? "*",
    allowSelfSignedCertificates: process.env.CORS_PROXY_ALLOW_SELF_SIGNED_CERTIFICATES === "true",
    verbose: process.env.CORS_PROXY_VERBOSE === "true",
  });
};

run();
