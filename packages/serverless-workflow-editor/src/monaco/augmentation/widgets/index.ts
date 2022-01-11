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

import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import IEditorMouseEvent = editor.IEditorMouseEvent;

function createIframe(posx: number, posy: number): HTMLDivElement {
  const widget: HTMLDivElement = document.createElement("div");
  widget.innerHTML =
    "<div> " +
    "\n<div style='width: 100%; height: 450px'><iframe style='width: 100%; height: 100%' src='https://sandbox.kie.org'></iframe></div>" +
    "<button>Close me</button>" +
    "</div>";

  widget.style.padding = "5px";
  widget.style.border = "solid black 1px";
  widget.style.backgroundColor = "white";
  widget.style.width = "500px";
  widget.style.height = "500px";
  widget.style.left = `${posx}px`;
  widget.style.top = `${posy}px`;
  return widget;
}

function createWidget(posx: number, posy: number): HTMLDivElement {
  const widget: HTMLDivElement = document.createElement("div");
  widget.innerHTML =
    "<p>Choose your editor's colors:</p>\n" +
    "\n" +
    "<div>\n" +
    '    <input type="color" id="color" name="head">\n' +
    '    <label for="color">Color</label>\n' +
    "    <iframe src='https://sandbox.kie.org'></iframe> " +
    "</div>";

  widget.style.padding = "5px";
  widget.style.border = "solid black 1px";
  widget.style.backgroundColor = "white";
  widget.style.width = "100%";
  widget.style.height = "100%";
  widget.style.left = `${posx}px`;
  widget.style.top = `${posy}px`;
  return widget;
}

export function showWidget(event: IEditorMouseEvent, editor: IStandaloneCodeEditor) {
  console.log(event.target.position?.column + " " + event.target.position?.lineNumber);

  const model: editor.ITextModel | null = editor.getModel();

  if (model) {
    const position = event.target.position;
    if (position) {
      const lineContent = model.getLineContent(position.lineNumber || 0);
      if (lineContent.includes(`"functions"`)) {
        const widget = createIframe(event.event.posx, event.event.posy);

        const myWidget: editor.IOverlayWidget = {
          getDomNode(): HTMLElement {
            return widget;
          },
          getPosition(): editor.IOverlayWidgetPosition | null {
            return null;
          },
          getId(): string {
            return "myWidget";
          },
        };

        widget.addEventListener("click", (e) => {
          editor.removeOverlayWidget(myWidget);
        });
        widget.addEventListener("change", (e) => {
          editor.removeOverlayWidget(myWidget);
          if (e.target) {
            const input = e.target as HTMLInputElement;

            monaco.editor.defineTheme("myTheme", {
              base: "vs",
              inherit: true,
              rules: [],
              colors: {
                "editor.background": input.value,
              },
            });
            monaco.editor.setTheme("myTheme");
          }
        });

        editor.addOverlayWidget(myWidget);
      }
    }
  }

  //editor.addOverlayWidget()
}
