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
import { connectField } from "uniforms";
import { TextInputProps } from "@patternfly/react-core";

import { useAddFormElementToContext } from "./CodeGenContext";
import { FormInput, InputReference } from "../api";
import { buildDefaultInputElement, getInputReference, renderField } from "./utils/Utils";
import { DATE_FUNCTIONS } from "./staticCode/staticCodeBlocks";

export type TextFieldProps = {
  id: string;
  label: string;
  value?: string;
  onChange: (value?: string) => void;
  disabled: boolean;
  field?: { format: string };
} & Omit<TextInputProps, "isDisabled">;

const Text: React.FC<TextFieldProps> = (props: TextFieldProps) => {
  const ref: InputReference = getInputReference(props.name);

  const isDate: boolean = props.type === "date" || props.field.format === "date";

  const getDateElement = (): FormInput => {
    const inputJsxCode = `<DatePicker
          id={'date-picker-${props.id}'}
          isDisabled={${props.disabled || false}}
          name={'${props.name}'}
          onChange={newDate => onDateChange(newDate, ${ref.stateSetter},  ${ref.stateName})}
          value={parseDate(${ref.stateName})}
        />`;
    return buildDefaultInputElement({
      pfImports: ["DatePicker"],
      inputJsxCode,
      ref,
      dataType: "Date",
      requiredCode: [DATE_FUNCTIONS],
      wrapper: {
        id: props.id,
        label: props.label,
        required: props.required,
      },
    });
  };

  const getTextInputElement = (): FormInput => {
    const inputJsxCode = `<TextInput
        name={'${props.name}'}
        id={'${props.id}'}
        isDisabled={${props.disabled || "false"}}
        placeholder={'${props.placeholder}'}
        type={'${props.type || "text"}'}
        value={${ref.stateName}}
        onChange={${ref.stateSetter}}
        />`;

    return buildDefaultInputElement({
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
  };

  const element = isDate ? getDateElement() : getTextInputElement();

  useAddFormElementToContext(element);

  return renderField(element);
};

export default connectField(Text, { kind: "leaf" });
