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

import React from "react";
import { TextInputProps } from "@patternfly/react-core";
import { connectField } from "uniforms/es5";

import { buildDefaultInputElement, getInputReference, renderField } from "./utils/Utils";
import { useAddFormElementToContext } from "./CodeGenContext";
import { FormInput, InputReference } from "../api";

export type NumFieldProps = {
  id: string;
  label: string;
  decimal?: boolean;
  value?: string;
  onChange: (value?: string) => void;
  disabled: boolean;
} & Omit<TextInputProps, "isDisabled">;

const Num: React.FC<NumFieldProps> = (props: NumFieldProps) => {
  const ref: InputReference = getInputReference(props.name);

  const max = props.max ? `max={${props.max}}` : "";
  const min = props.min ? `min={${props.min}}` : "";

  const inputJsxCode = `<TextInput
      type={'number'}
      name={'${props.name}'}
      isDisabled={${props.disabled || "false"}}
      id={'${props.id}'}
      placeholder={'${props.placeholder}'}
      step={${props.decimal ? 0.01 : 1}} ${max} ${min}
      value={${ref.stateName}}
      onChange={${ref.stateSetter}}
    />`;

  const element: FormInput = buildDefaultInputElement({
    pfImports: ["TextInput"],
    inputJsxCode,
    ref,
    dataType: "string",
    wrapper: {
      id: props.id,
      label: props.label,
      required: props.required,
    },
  });

  useAddFormElementToContext(element);

  return renderField(element);
};

export default connectField(Num);
