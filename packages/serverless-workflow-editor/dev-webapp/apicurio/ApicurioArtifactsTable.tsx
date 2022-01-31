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
import { SearchedArtifact } from "@rhoas/registry-instance-sdk";
import { TableComposable, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { ButtonVariant } from "@patternfly/react-core/dist/js/components/Button";
import { Button } from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons/dist/js/icons/search-icon";

export interface ApicurioArtifactsTableProps {
  artifacts: SearchedArtifact[];
  loadContent: (groupId: string, id: string) => void;
}

export const ApicurioArtifactsTable: React.FC<ApicurioArtifactsTableProps> = (props) => {
  return (
    <TableComposable>
      <Thead>
        <Tr>
          <Th>Id</Th>
          <Th>Name</Th>
          <Th>Type</Th>
          <Th>Group</Th>
          <Th></Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.artifacts.map((artifact) => (
          <Tr key={artifact.id}>
            <Td dataLabel={artifact.id}>{artifact.id}</Td>
            <Td dataLabel={artifact.name}>{artifact.name}</Td>
            <Td dataLabel={artifact.type}>{artifact.type}</Td>
            <Td dataLabel={artifact.groupId}>{artifact.groupId}</Td>
            <Td dataLabel={""}>
              <Button
                variant={ButtonVariant.control}
                onClick={() => props.loadContent(artifact.groupId ?? "", artifact.id)}
              >
                <SearchIcon />
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};
