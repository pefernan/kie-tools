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

import swfEnvelopeIndex from "!!raw-loader!../../dist/resources/swf/swfEnvelopeIndex.html";
import { createEditor, Editor, StandaloneEditorApi } from "../common/Editor";
import { StateControl } from "@kie-tools-core/editor/dist/channel";
import { EnvelopeServer } from "@kie-tools-core/envelope-bus/dist/channel";
import { ChannelType, KogitoEditorChannelApi } from "@kie-tools-core/editor/dist/api";
import { StandaloneEditorsEditorChannelApiImpl } from "../envelope/StandaloneEditorsEditorChannelApiImpl";
import { ContentType } from "@kie-tools-core/workspace/dist/api";
import { ServerlessWorkflowDiagramEditorEnvelopeApi } from "@kie-tools/serverless-workflow-diagram-editor-envelope/dist/api";

declare global {
  interface Window {
    SwfEditor: Editor;
  }
}

const createEnvelopeServer = (iframe: HTMLIFrameElement, readOnly?: boolean, origin?: string) => {
  const defaultOrigin = window.location.protocol === "file:" ? "*" : window.location.origin;

  return new EnvelopeServer<KogitoEditorChannelApi, ServerlessWorkflowDiagramEditorEnvelopeApi>(
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
          channel: ChannelType.EMBEDDED,
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
}): StandaloneEditorApi => {
  console.log(1, args);
  const iframe = document.createElement("iframe");
  iframe.srcdoc = swfEnvelopeIndex;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  console.log(2);
  const envelopeServer = createEnvelopeServer(iframe, args.readOnly, args.origin);

  const stateControl = new StateControl();

  let receivedSetContentError = false;
  console.log(3);
  const channelApiImpl = new StandaloneEditorsEditorChannelApiImpl(
    stateControl,
    {
      fileName: "",
      fileExtension: "sw.json",
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
  );

  const listener = (message: MessageEvent) => {
    envelopeServer.receive(message.data, channelApiImpl);
  };
  window.addEventListener("message", listener);
  console.log(4);

  args.container.appendChild(iframe);
  envelopeServer.startInitPolling(channelApiImpl);

  const editor = createEditor(envelopeServer.envelopeApi, stateControl, listener, iframe);
  console.log(5, editor);
  return {
    ...editor,
  };
};

window.SwfEditor = { open };
