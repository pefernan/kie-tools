/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
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

import * as vscode from "vscode";
import { KogitoEditorFactory } from "./KogitoEditorFactory";
import { KogitoEditingDelegate } from "./KogitoEditingDelegate";
import { KogitoEdit } from "@kogito-tooling/core-api";

export class KogitoWebviewProvider implements vscode.WebviewCustomEditorProvider {
  private readonly editorFactory: KogitoEditorFactory;
  public readonly editingDelegate?: vscode.WebviewCustomEditorEditingDelegate<KogitoEdit>;

  public constructor(editorFactory: KogitoEditorFactory, editingDelegate: KogitoEditingDelegate) {
    this.editorFactory = editorFactory;
    this.editingDelegate = editingDelegate;
  }

  public async resolveWebviewEditor(resource: vscode.Uri, webview: vscode.WebviewPanel) {
    this.editorFactory.configureNew(resource, webview, (edit: KogitoEdit) => {
      (this.editingDelegate as KogitoEditingDelegate).signalEdit(resource, edit);
    });
  }

  public register() {
    return vscode.window.registerWebviewCustomEditorProvider("kieKogitoWebviewEditors", this, {
      retainContextWhenHidden: true
    });
  }
}
