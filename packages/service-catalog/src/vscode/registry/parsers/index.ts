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

import { FunctionDefinition, FunctionType, ServiceDefinition, ServiceType } from "../../../api";

import * as yaml from "js-yaml";

export function loadOpenAPIService(args: {
  fileName: string;
  storagePath: string;
  content: string;
  consumer: (serviceDef: ServiceDefinition, functions: FunctionDefinition[]) => void;
}): void {
  type t = unknown & any;
  const doc: t = yaml.load(args.content);

  const functionDefinitionObjs: any = [];
  const paths = doc.paths;
  const components = doc.components;

  Object.getOwnPropertyNames(paths).forEach((url) => {
    if (Object.prototype.hasOwnProperty.call(paths[`${url}`], "post")) {
      functionDefinitionObjs.push({ [url]: paths[url].post });
    }
  });

  const servicePath = args.storagePath + "/" + args.fileName;

  args.consumer(
    {
      name: servicePath,
      type: ServiceType.rest,
      id: servicePath,
    },
    createFunctionDefinitionList(functionDefinitionObjs, components, servicePath)
  );
}

export const createFunctionDefinitionList = (
  functionDefinitionObjs: any[],
  components: any,
  path: string
): FunctionDefinition[] => {
  const functionDefinitionList: FunctionDefinition[] = [] as FunctionDefinition[];

  functionDefinitionObjs.forEach((processDefObj: any) => {
    const functionDefinition: FunctionDefinition = {} as FunctionDefinition;
    const obj: any = processDefObj[Object.keys(processDefObj)[0]];
    const functionName: string = Object.keys(processDefObj)[0].replace(/^\/+/, "");

    functionDefinition.name = obj.operationId ? obj.operationId : functionName;
    functionDefinition.operation = `${path}#${functionDefinition.name}`;

    const content = (obj?.requestBody || {}).content;
    const ref = content && content[`${Object.keys(content)[0]}`]["schema"]["$ref"]?.split("/").pop();

    let funcArguments: any = {};

    if (ref) {
      funcArguments = components?.schemas[`${ref}`];

      functionDefinition.arguments = funcArguments.properties || {};
      functionDefinition.type = FunctionType.rest;
    }
    functionDefinitionList.push(functionDefinition);
  });

  return functionDefinitionList;
};
