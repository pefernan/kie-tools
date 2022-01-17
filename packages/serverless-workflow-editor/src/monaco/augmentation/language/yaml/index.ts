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

import { MonacoLanguage } from "../MonacoLanguage";
import { setDiagnosticsOptions } from "monaco-yaml";
import { CancellationToken, editor, languages, Position } from "monaco-editor";
import * as yamlParser from "yaml-language-server/lib/esm/languageservice/parser/yamlParser07";
import * as yaml from "yaml-language-server/lib/esm/languageservice/yamlLanguageService";
import { TextDocument } from "vscode-languageserver-types";

import {
  SW_SPEC_COMMON_SCHEMA,
  SW_SPEC_EVENTS_SCHEMA,
  SW_SPEC_FUNCTIONS_SCHEMA,
  SW_SPEC_RETRIES_SCHEMA,
  SW_SPEC_SCHEMA,
} from "../schemas";
import { JSONSchema7 } from "json-schema";

export function initYAMLLanguage(): MonacoLanguage {
  setDiagnosticsOptions({
    enableSchemaRequest: true,
    hover: true,
    completion: true,
    validate: true,
    format: true,
    schemas: [
      {
        uri: "common.json",
        fileMatch: ["*"],
        schema: SW_SPEC_COMMON_SCHEMA,
      },
      {
        uri: "events.json",
        fileMatch: ["*"],
        schema: SW_SPEC_EVENTS_SCHEMA as JSONSchema7,
      },
      {
        uri: "functions.json",
        fileMatch: ["*"],
        schema: SW_SPEC_FUNCTIONS_SCHEMA as JSONSchema7,
      },
      {
        uri: "retries.json",
        fileMatch: ["*"],
        schema: SW_SPEC_RETRIES_SCHEMA as JSONSchema7,
      },
      {
        uri: "workflow.json",
        fileMatch: ["*"],
        schema: SW_SPEC_SCHEMA as JSONSchema7,
      },
    ],
  });

  return {
    languageId: "yaml",

    getDefaultContent: (content) => {
      if (!content) {
        return "";
      }
      return content;
    },
  };
}

export function getYAMLSuggestions(
  model: editor.ITextModel,
  position: Position,
  context: languages.CompletionContext,
  token: CancellationToken
) {
  const doc = TextDocument.create("", "yaml", model.getVersionId(), model.getValue());
  //yaml.getLanguageService()
  const offset = doc.offsetAt({
    line: position.lineNumber - 1,
    character: position.column,
  });

  const yamlDocs = yamlParser.parse(model.getValue());

  const yamlDoc = yamlDocs.documents[0];

  const node = yamlDoc.getNodeFromOffset(offset, true);

  console.log(node);

  return null;
}
