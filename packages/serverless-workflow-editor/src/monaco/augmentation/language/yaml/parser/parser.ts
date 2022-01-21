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

import * as Yaml from "yaml-language-server-parser";
import { SingleYAMLDocument, YAMLDocument } from "./types";
import recursivelyBuildAst from "./recursivelyBuildAst";

const YAML_DATA_INSTANCE_SEPARATOR = "---";

export function parse(text: string): YAMLDocument {
  const yamlNodes: Yaml.YAMLNode[] = [];
  Yaml.loadAll(text, (doc) => yamlNodes.push(doc));

  // Generate the SingleYAMLDocs from the AST nodes
  const startPositions = getLineStartPositions(text);
  const yamlDocs: SingleYAMLDocument[] = yamlNodes.map((node) => nodeToSingleDoc(node, startPositions, text));

  return new YAMLDocument(yamlDocs);
}

function nodeToSingleDoc(yamlNode: Yaml.YAMLNode, startPositions: number[], text: string): SingleYAMLDocument {
  return new SingleYAMLDocument(startPositions, recursivelyBuildAst(yamlNode));
}

function getLineStartPositions(text: string): number[] {
  const lineStartPositions = [0];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (c === "\r") {
      // Check for Windows encoding, otherwise we are old Mac
      if (i + 1 < text.length && text[i + 1] === "\n") {
        i++;
      }

      lineStartPositions.push(i + 1);
    } else if (c === "\n") {
      lineStartPositions.push(i + 1);
    }
  }

  return lineStartPositions;
}
