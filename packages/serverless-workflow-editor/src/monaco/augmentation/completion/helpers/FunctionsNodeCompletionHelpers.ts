/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
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

import * as monaco from "monaco-editor";
import { languages, Position } from "monaco-editor";
import { ASTNode, ObjectASTNode, PropertyASTNode } from "../../language/parser";
import { CompletionContext, CompletionHelper } from "./CompletionHelper";
import { MonacoLanguage } from "../../language";
import { FunctionDefinition } from "@kie-tools/service-catalog/dist/api";

const FUNCTIONS_NODE = "functions";

function checkFunctionsPropertyNode(functionsNode: ASTNode): boolean {
  // check if node is a the functions node in the root object and the type is an array.
  if (functionsNode.type !== "array") {
    return false;
  }

  if (!functionsNode.parent) {
    return false;
  }

  const asProp = functionsNode.parent as PropertyASTNode;

  if (!asProp.parent || asProp.parent.parent) {
    return false;
  }

  return asProp.keyNode && asProp.keyNode.value.toLowerCase() === FUNCTIONS_NODE;
}

interface SWFunctionDef {
  name: string;
  operation: string;
  type: string;
}

function functionDef2Suggestion(
  functionDefinition: SWFunctionDef,
  position: Position,
  language: MonacoLanguage
): languages.CompletionItem {
  return {
    label: functionDefinition.operation,
    kind: monaco.languages.CompletionItemKind.Value,
    insertText: language.getStringValue(functionDefinition),
    range: {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: position.column,
      endColumn: position.column,
    },
  };
}

export class FunctionObjectCompletionHelper implements CompletionHelper {
  public matches = (node: ASTNode): boolean => {
    return checkFunctionsPropertyNode(node);
  };

  getSuggestions = (context: CompletionContext): Promise<languages.CompletionItem[]> => {
    console.log("FunctionObjectCompletionHelper");
    return new Promise<languages.CompletionItem[]>((resolve) => {
      context.catalog.getFunctions().then((functions: FunctionDefinition[]) => {
        const suggestions: languages.CompletionItem[] = [];

        functions.forEach((def: FunctionDefinition) => {
          const suggestion = functionDef2Suggestion(
            { name: def.name, operation: def.operation, type: def.type },
            context.monacoContext.position,
            context.language
          );
          suggestions.push(suggestion);
        });

        resolve(suggestions);
      });
    });

    return Promise.resolve([]);
  };
}

export class FunctionObjectContentCompletionHelper implements CompletionHelper {
  getSuggestions = (context: CompletionContext): Thenable<languages.CompletionItem[]> => {
    console.log("FunctionObjectContentCompletionHelper");
    context.catalog.getServiceCatalog();
    console.log("end");
    return Promise.resolve([]);
  };

  public matches = (node: ASTNode): boolean => {
    // check if node has parent ("functions" node)
    if (!node.parent) {
      return false;
    }

    if (!checkFunctionsPropertyNode(node.parent)) {
      return false;
    }

    if (node.type === "null") {
      return true;
    }

    if (node.type !== "object") {
      return false;
    }

    const objetNode = node as ObjectASTNode;

    return !(objetNode.properties && objetNode.properties.length > 0);
  };
}
