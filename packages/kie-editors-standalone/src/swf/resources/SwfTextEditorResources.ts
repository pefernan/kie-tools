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

import * as fs from "fs";
import { BaseEditorResources, EditorResources, FontResource, ReferencedResource } from "../../common/EditorResources";
import * as stunnerEditors from "@kie-tools/stunner-editors";
import { getServerlessWorkflowLanguageData } from "@kie-tools/serverless-workflow-diagram-editor-envelope/dist/api";
import * as swfMermaidEditorAssets from "@kie-tools/serverless-workflow-mermaid-editor-assets";

export class ServerlessworkflowTextEditorResources extends BaseEditorResources {
  public get(args: { resourcesPathPrefix: string }) {
    const swfTextEditorResources: any = {
      envelopeJsResource: this.createResource({ path: `dist/envelope/swf-text-editor-envelope.js` }),
    };
    return swfTextEditorResources;
  }

  public getReferencedJSPaths(resourcesPathPrefix: string, gwtModuleName: string) {
    return [];
  }

  public getReferencedCSSPaths(resourcesPathPrefix: string, gwtModuleName: string) {
    return [];
  }

  public getFontResources(resourcesPathPrefix: string, gwtModuleName: string) {
    return [];
  }
  public getEditorResourcesPath() {
    return "";
  }

  public getTemplatePath() {
    return "dist/resources/swf/swfTextEditorEnvelopeIndex.template";
  }

  public getHtmlOutputPath() {
    return "dist/resources/swf/swfTextEditorEnvelopeIndex.html";
  }
}
