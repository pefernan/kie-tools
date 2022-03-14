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

import * as fs from "fs";
import * as path from "path";
import { parseOpenApi } from "@kie-tools/serverless-workflow-service-catalog/dist/channel";
import {
  SwfFunctionArgumentType,
  SwfFunctionType,
  SwfService,
  SwfServiceType,
} from "@kie-tools/serverless-workflow-service-catalog/dist/api";

function doParse(fileName: string): SwfService {
  const filePath = path.resolve(__dirname, `examples/${fileName}`);
  const content = fs.readFileSync(filePath).toString("utf-8");

  return parseOpenApi({
    fileName,
    content,
    storagePath: "specs",
  });
}

describe("openapi parser", () => {
  it("parse multiplication openapi", async () => {
    const result = doParse("multiplication.yaml");

    expect(result).not.toBeNull();
    expect(result.type).toBe(SwfServiceType.rest);
    expect(result.id).toBe("specs/multiplication.yaml");
    expect(result.name).toBe("Generated API");

    expect(result.functions).toHaveLength(2);

    const doGetOperation = result.functions[0];
    expect(doGetOperation.type).toBe(SwfFunctionType.rest);
    expect(doGetOperation.name).toBe("doGetOperation");
    expect(doGetOperation.operation).toBe("specs/multiplication.yaml#doGetOperation");
    expect(doGetOperation.arguments).not.toBeNull();
    expect(doGetOperation.arguments).toHaveProperty("leftElement", SwfFunctionArgumentType.number);
    expect(doGetOperation.arguments).toHaveProperty("product", SwfFunctionArgumentType.number);
    expect(doGetOperation.arguments).toHaveProperty("rightElement", SwfFunctionArgumentType.number);

    const doPostOperation = result.functions[1];
    expect(doPostOperation.type).toBe(SwfFunctionType.rest);
    expect(doPostOperation.name).toBe("doOperation");
    expect(doPostOperation.operation).toBe("specs/multiplication.yaml#doOperation");
    expect(doPostOperation.arguments).not.toBeNull();
    expect(doPostOperation.arguments).toHaveProperty("leftElement", SwfFunctionArgumentType.number);
    expect(doPostOperation.arguments).toHaveProperty("product", SwfFunctionArgumentType.number);
    expect(doPostOperation.arguments).toHaveProperty("rightElement", SwfFunctionArgumentType.number);
  });

  it("parse hiring openapi", async () => {
    const result = doParse("hiring.yaml");

    expect(result).not.toBeNull();
    expect(result.type).toBe(SwfServiceType.rest);
    expect(result.id).toBe("specs/hiring.yaml");
    expect(result.name).toBe("process-usertasks-timer-quarkus-with-console API");

    expect(result.functions).toHaveLength(1);

    const functionDef = result.functions[0];
    expect(functionDef.type).toBe(SwfFunctionType.rest);
    expect(functionDef.name).toBe("hiring");
    expect(functionDef.operation).toBe("specs/hiring.yaml#hiring");
    expect(functionDef.arguments).not.toBeNull();
    expect(functionDef.arguments).toHaveProperty("candidate", SwfFunctionArgumentType.object);
    expect(functionDef.arguments).toHaveProperty("hr_approval", SwfFunctionArgumentType.boolean);
    expect(functionDef.arguments).toHaveProperty("it_approval", SwfFunctionArgumentType.boolean);
  });

  it("parse wrong format test", async () => {
    expect(() => {
      doParse("wrong.txt");
    }).toThrowError("Invalid format");

    expect(() => {
      doParse("wrong.json");
    }).toThrowError("Invalid format");
  });
});
