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
import { WebviewCustomEditorEditingDelegate } from "vscode";
import { KogitoEditorStore } from "./KogitoEditorStore";
import { KogitoEdit } from "@kogito-tooling/core-api";

export class KogitoEditingDelegate implements WebviewCustomEditorEditingDelegate<KogitoEdit> {
  private readonly _onEdit = new vscode.EventEmitter<{
    readonly resource: vscode.Uri;
    readonly edit: KogitoEdit;
  }>();

  private readonly editorStore: KogitoEditorStore;
  public readonly onEdit: vscode.Event<{ readonly resource: vscode.Uri; readonly edit: KogitoEdit }>;

  public constructor(editorStore: KogitoEditorStore) {
    this.editorStore = editorStore;
    this.onEdit = this._onEdit.event;
  }

  public async save(resource: vscode.Uri) {
    this.editorStore.withActive(activeEditor => activeEditor.requestSave());
    console.info("save");
  }

  public async saveAs(resource: vscode.Uri, targetResource: vscode.Uri) {
    console.info("saveAs");
  }

  public async undoEdits(resource: vscode.Uri, edits: KogitoEdit[]) {
    console.debug("KogitoEditingDelegate undo");
    this.editorStore.withActive(activeEditor => activeEditor.requestUndo(edits))
  }

  public async applyEdits(resource: vscode.Uri, edits: KogitoEdit[]) {
    console.debug("KogitoEditingDelegate redo");
    this.editorStore.withActive(activeEditor => activeEditor.requestRedo(edits))
  }

  public signalEdit(resource: vscode.Uri, edit: KogitoEdit): void {
    console.debug("KogitoEditingDelegate signalEdit: " + edit.id);
    this._onEdit.fire({
      resource: resource,
      edit: edit
    });
  }
}
