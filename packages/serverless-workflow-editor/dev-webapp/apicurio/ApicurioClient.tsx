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

import * as React from "react";
import { useImperativeHandle, useState } from "react";
import { Modal, ModalVariant } from "@patternfly/react-core";
import { ApicurioClientExplorer } from "./ApicurioClientExplorer";

const basePath = "http://localhost:8080/apis/registry/v2";

export interface ApicurioClientRef {
  show: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ApicurioClientProps {}

const ApicurioClientRef: React.ForwardRefRenderFunction<ApicurioClientRef | undefined, ApicurioClientProps> = (
  props: ApicurioClientProps,
  forwardRef
) => {
  const [display, setDisplay] = useState<boolean>(false);

  useImperativeHandle(forwardRef, () => ({
    show: () => setDisplay(true),
  }));

  return (
    <Modal variant={ModalVariant.medium} title={"Apicurio Explorer"} isOpen={display} onClose={() => setDisplay(false)}>
      <ApicurioClientExplorer />
    </Modal>
  );
};

export const ApicurioClient = React.forwardRef(ApicurioClientRef);
