/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
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

import swfCombinedEditorEnvelopeIndex from "!!raw-loader!../../dist/resources/swf/swfCombinedEditorEnvelopeIndex.html";
import swfDiagramEditorEnvelopeIndex from "!!raw-loader!../../dist/resources/swf/swfDiagramEditorEnvelopeIndex.html";
import swfMermaidViewerEnvelopeIndex from "!!raw-loader!../../dist/resources/swf/swfMermaidViewerEnvelopeIndex.html";
import swfTextEditorEnvelopeIndex from "!!raw-loader!../../dist/resources/swf/swfTextEditorEnvelopeIndex.html";
import { createEditor, Editor, StandaloneEditorApi, ServerlessWorkflowType } from "../common/Editor";
import { StateControl } from "@kie-tools-core/editor/dist/channel";
import { EnvelopeServer } from "@kie-tools-core/envelope-bus/dist/channel";
import { ChannelType, KogitoEditorChannelApi, KogitoEditorEnvelopeApi } from "@kie-tools-core/editor/dist/api";
import { StandaloneEditorsEditorChannelApiImpl } from "../envelope/StandaloneEditorsEditorChannelApiImpl";
import { ContentType } from "@kie-tools-core/workspace/dist/api";
import {
  SwfCombinedEditorChannelApiImpl,
  SwfFeatureToggleChannelApiImpl,
  SwfServiceCatalogChannelApiImpl,
  SwfLanguageServiceChannelApiImpl,
  SwfPreviewOptionsChannelApiImpl,
  SwfStaticEnvelopeContentProviderChannelApiImpl,
} from "@kie-tools/serverless-workflow-combined-editor/dist/impl";
import { ServerlessWorkflowCombinedEditorChannelApi } from "@kie-tools/serverless-workflow-combined-editor/dist/api";
import { MessageBusClientApi } from "@kie-tools-core/envelope-bus/dist/api";
import { SwfServiceCatalogChannelApi } from "@kie-tools/serverless-workflow-service-catalog/dist/api";

declare global {
  interface Window {
    SwfEditor: Editor;
  }
}

const createEnvelopeServer = (iframe: HTMLIFrameElement, readOnly?: boolean, origin?: string) => {
  const defaultOrigin = window.location.protocol === "file:" ? "*" : window.location.origin;

  return new EnvelopeServer<KogitoEditorChannelApi, KogitoEditorEnvelopeApi>(
    { postMessage: (message) => iframe.contentWindow?.postMessage(message, "*") },
    origin ?? defaultOrigin,
    (self) => {
      return self.envelopeApi.requests.kogitoEditor_initRequest(
        {
          origin: self.origin,
          envelopeServerId: self.id,
        },
        {
          resourcesPathPrefix: "",
          fileExtension: "sw.json",
          initialLocale: "en-US",
          isReadOnly: readOnly ?? true,
          channel: ChannelType.STANDALONE,
        }
      );
    }
  );
};

export const open = (args: {
  container: Element;
  initialContent: Promise<string>;
  readOnly?: boolean;
  origin?: string;
  onError?: () => any;
  resources?: Map<string, { contentType: ContentType; content: Promise<string> }>;
  languageType?: ServerlessWorkflowType;
}): StandaloneEditorApi => {
  const iframe = document.createElement("iframe");
  iframe.srcdoc = swfCombinedEditorEnvelopeIndex;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  const envelopeServer = createEnvelopeServer(iframe, args.readOnly, args.origin);

  const stateControl = new StateControl();

  let receivedSetContentError = false;

  const channelApiImpl = new SwfCombinedEditorChannelApiImpl(
    new StandaloneEditorsEditorChannelApiImpl(
      stateControl, // might try EmbeddedEditorChannelApiImpl here :S
      {
        fileName: `new-document.sw.${args.languageType}`, // TODO: make this a bit smarter :S
        fileExtension: `sw.${args.languageType}`,
        getFileContents: () => Promise.resolve(args.initialContent),
        isReadOnly: args.readOnly ?? false,
      },
      "en-US",
      {
        kogitoEditor_setContentError() {
          if (!receivedSetContentError) {
            args.onError?.();
            receivedSetContentError = true;
          }
        },
      },
      args.resources
    ),
    new SwfFeatureToggleChannelApiImpl({ stunnerEnabled: true }),
    new SwfServiceCatalogChannelApiImpl(
      envelopeServer.envelopeApi as unknown as MessageBusClientApi<SwfServiceCatalogChannelApi>,
      [],
      { registries: [] }
    ),
    new SwfLanguageServiceChannelApiImpl(
      envelopeServer.envelopeApi as unknown as MessageBusClientApi<ServerlessWorkflowCombinedEditorChannelApi>
    ),
    new SwfPreviewOptionsChannelApiImpl(undefined),
    new SwfStaticEnvelopeContentProviderChannelApiImpl({
      diagramEditorEnvelopeContent: swfDiagramEditorEnvelopeIndex,
      mermaidEnvelopeContent: swfMermaidViewerEnvelopeIndex,
      textEditorEnvelopeContent: swfTextEditorEnvelopeIndex,
    })
  );

  const listener = (message: MessageEvent) => {
    envelopeServer.receive(message.data, channelApiImpl);
  };
  window.addEventListener("message", listener);

  args.container.appendChild(iframe);
  envelopeServer.startInitPolling(channelApiImpl);

  const editor = createEditor(envelopeServer.envelopeApi, stateControl, listener, iframe);
  return {
    ...editor,
  };
};

window.SwfEditor = { open };