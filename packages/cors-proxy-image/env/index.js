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

const { varsWithName, getOrDefault, composeEnv } = require("@kie-tools-scripts/build-env");

module.exports = composeEnv([require("@kie-tools/root-env/env")], {
  vars: varsWithName({
    CORS_PROXY__imageRegistry: {
      default: "quay.io",
      description: "",
    },
    CORS_PROXY__imageAccount: {
      default: "kie-tools",
      description: "",
    },
    CORS_PROXY__imageName: {
      default: "cors-proxy-image",
      description: "",
    },
    CORS_PROXY__imageBuildTags: {
      default: "latest",
      description: "",
    },
    CORS_PROXY__port: {
      default: 8080,
      description: "HTTP Port the proxy should listen to",
    },
    CORS_PROXY__origin: {
      default: "*",
      description: "Value to set on the 'Access-Control-Allow-Origin' header",
    },
    CORS_PROXY__selfSignedCertificates: {
      default: false,
      description:
        "Allows the proxy supporting self-signed certificates, useful for local development. It disables the certificate validation, not recommended for production environments",
    },
    CORS_PROXY__verbose: {
      default: false,
      description: "Allows the proxy to run in verbose mode... useful to trace requests on development environments",
    },
  }),
  get env() {
    return {
      corsProxy: {
        config: {
          port: getOrDefault(this.vars.CORS_PROXY__port),
          origin: getOrDefault(this.vars.CORS_PROXY__origin),
          selfSignedCertificates: getOrDefault(this.vars.CORS_PROXY__selfSignedCertificates),
          verbose: getOrDefault(this.vars.CORS_PROXY__verbose),
        },
        image: {
          registry: getOrDefault(this.vars.CORS_PROXY__imageRegistry),
          account: getOrDefault(this.vars.CORS_PROXY__imageAccount),
          name: getOrDefault(this.vars.CORS_PROXY__imageName),
          buildTags: getOrDefault(this.vars.CORS_PROXY__imageBuildTags),
        },
      },
    };
  },
});
