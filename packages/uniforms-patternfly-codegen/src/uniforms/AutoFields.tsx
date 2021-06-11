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

import { ComponentType, createElement } from "react";
import { useForm } from "uniforms/es5";

import AutoField from "./AutoField";

export type AutoFieldsProps = {
  autoField?: ComponentType<{ name: string }>;
  element?: ComponentType | string;
  fields?: string[];
  omitFields?: string[];
};

export default function AutoFields({ autoField, element, fields, omitFields, ...props }: AutoFieldsProps) {
  const { schema } = useForm();

  return createElement(
    element!,
    props,
    (fields ?? schema.getSubfields())
      .filter((field) => !omitFields!.includes(field))
      .map((field) => createElement(autoField!, { key: field, name: field }))
  );
}

AutoFields.defaultProps = {
  autoField: AutoField,
  element: "div",
  omitFields: [],
};
