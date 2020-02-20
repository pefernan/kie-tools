/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
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

import { KogitoCommandRegistry, KogitoCommandRegistryImpl } from "./registry/KogitoCommandRegistry";
import { KogitoEdit } from "./KogitoEdit";

export class StateControl {

  public readonly registry: KogitoCommandRegistry<any>;

  private undoCommand: () => void;
  private redoCommand: () => void;

  constructor(registry: KogitoCommandRegistry<any>) {
    this.registry = registry;
  }

  public undo(edits?: KogitoEdit[]): void {
    console.info("UNDO: " + edits);
    if(edits) {
      console.info("UNDO: " + edits.length);
      edits.forEach(edit => console.info("edit: " + edit.id))
    }

    if (this.undoCommand) {
      this.undoCommand();
    }
  }

  public redo(edits?: KogitoEdit[]): void {
    console.info("REDO: " + edits);
    if(edits) {
      console.info("REDO: " + edits.length);
      edits.forEach(edit => console.info("edit: " + edit.id))
    }

    if (this.redoCommand) {
      this.redoCommand();
    }
  }

  public getCommandRegistry<T>(): KogitoCommandRegistry<T> {
    return this.registry;
  }

  public setUndoCommand(undoCommand: () => void): void {
    this.undoCommand = undoCommand;
  }

  public setRedoCommand(redoCommand: () => void): void {
    this.redoCommand = redoCommand;
  }
}