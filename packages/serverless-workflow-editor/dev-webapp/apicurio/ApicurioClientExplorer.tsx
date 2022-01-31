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
import { useMemo, useState } from "react";
import { ArtifactsApi, Configuration, SearchedArtifact } from "@rhoas/registry-instance-sdk";
import { Button, TextInput } from "@patternfly/react-core";
import { Toolbar, ToolbarContent, ToolbarItem } from "@patternfly/react-core/dist/js/components/Toolbar";
import { ApicurioEmptyState } from "./ApicurioEmptyState";
import { ApicurioLoading } from "./ApicurioLoading";
import { ApicurioArtifactsTable } from "./ApicurioArtifactsTable";
import { ApicurioContentDisplayer } from "./ApicurioContentDisplayer";

export const ApicurioClientExplorer: React.FC<any> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [apicurioBasePath, setApicurioBasePath] = useState<string>();
  const [groupID, setGroupId] = useState<string>();
  const [artifacts, setArtifacts] = useState<SearchedArtifact[]>();
  const [artifactContent, setArtifactContent] = useState<any>();

  const registryInstance = useMemo<ArtifactsApi | null>(() => {
    if (!apicurioBasePath) {
      return null;
    }
    const apiConfig = new Configuration({
      basePath: apicurioBasePath,
    });

    return new ArtifactsApi(apiConfig);
  }, [apicurioBasePath]);

  const doSearch = () => {
    if (registryInstance) {
      setLoading(true);
      registryInstance
        .searchArtifacts()
        .then((response) => setArtifacts(response.data.artifacts ?? []))
        .finally(() => setLoading(false));
    }
  };

  const doGetArtifactContent = (groupId: string, id: string) => {
    if (registryInstance) {
      registryInstance.getLatestArtifact(groupId, id).then((content) => {
        setArtifactContent(JSON.stringify(content.data, null, 2));
      });
    }
  };

  if (artifactContent) {
    return <ApicurioContentDisplayer content={artifactContent} back={() => setArtifactContent(null)} />;
  }

  const header = (
    <Toolbar id="toolbar-items">
      <ToolbarContent>
        <ToolbarItem>
          <TextInput
            type="text"
            placeholder={"Apicurio Base Path"}
            value={apicurioBasePath}
            onChange={setApicurioBasePath}
            size={50}
          />
        </ToolbarItem>
        <ToolbarItem variant="separator" />
        <ToolbarItem>
          <Button variant="primary" onClick={() => doSearch()}>
            Search
          </Button>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const getBody = () => {
    if (loading) {
      return <ApicurioLoading />;
    }

    if (!artifacts || artifacts.length == 0) {
      return <ApicurioEmptyState />;
    }

    return <ApicurioArtifactsTable artifacts={artifacts} loadContent={doGetArtifactContent} />;
  };

  return (
    <div>
      {header}
      {getBody()}
    </div>
  );
};
