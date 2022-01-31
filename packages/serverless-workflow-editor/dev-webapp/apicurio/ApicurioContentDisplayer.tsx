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
import {
  ActionList,
  ActionListItem,
  Button,
  ButtonVariant,
  CodeBlock,
  CodeBlockCode,
  Title,
} from "@patternfly/react-core";

export interface ApicurioContentDisplayerProps {
  content: any;
  back: () => void;
}

export const ApicurioContentDisplayer: React.FC<ApicurioContentDisplayerProps> = ({ content, back }) => {
  return (
    <div>
      <Title headingLevel="h4" size="lg">
        Artifact content:
      </Title>
      <CodeBlock>
        <CodeBlockCode>{content}</CodeBlockCode>
      </CodeBlock>
      <ActionList>
        <ActionListItem>
          <Button variant={ButtonVariant.primary} onClick={back}>
            Back
          </Button>
        </ActionListItem>
      </ActionList>
    </div>
  );
};
