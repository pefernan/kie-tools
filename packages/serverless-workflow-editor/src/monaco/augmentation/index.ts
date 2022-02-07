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

import { DefaultMonacoEditor, MonacoEditorApi } from "./MonacoEditorApi";
import { lookupLanguage } from "./language";
import { initCompletion } from "./completion";
import { MonacoAugmentation } from "./MonacoAugmentation";
import { FunctionDefinition, ServiceDefinition } from "@kie-tools-core/service-catalog/dist/api";

export { MonacoEditorApi } from "./MonacoEditorApi";
export { MonacoAugmentation } from "./MonacoAugmentation";

export function buildEditor(
  content: string,
  fileName: string,
  onContentChange: (content: string) => void,
  getServiceCatalog: () => Promise<ServiceDefinition[]>
): MonacoEditorApi {
  const augmentation: MonacoAugmentation = {
    language: lookupLanguage(fileName),
    catalogService: {
      getServiceCatalog,
    },
  };

  initCompletion(augmentation);

  return new DefaultMonacoEditor(content, onContentChange, augmentation);
}
