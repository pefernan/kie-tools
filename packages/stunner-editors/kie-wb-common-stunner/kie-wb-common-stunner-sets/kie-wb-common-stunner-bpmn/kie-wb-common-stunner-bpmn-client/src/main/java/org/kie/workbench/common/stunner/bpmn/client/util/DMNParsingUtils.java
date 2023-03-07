/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
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

package org.kie.workbench.common.stunner.bpmn.client.util;

import java.util.ArrayList;
import java.util.List;

public class DMNParsingUtils {

    private static String namespaceTag = "namespace=\"";
    private static String endStringToken = "\"";

    private static String decisionNameStartTag = "<dmn:decision";
    private static String decisionNameTag = "name=\"";


    private static String parseField(final String fieldTag, final String endToken, final String content) {
        String fieldValue = "";

        if (content != null && !content.isEmpty()) {
            int beginIndex = content.indexOf(fieldTag);
            int endIndex = beginIndex + fieldTag.length() + content.substring(beginIndex + fieldTag.length()).indexOf(endToken);

            if (beginIndex != -1 && endIndex != beginIndex + fieldTag.length() - 1) {
                fieldValue = content.substring(beginIndex + fieldTag.length(), endIndex);
            }
        }
        return fieldValue;
    }

    public static String parseNamespace(final String string) {
        return parseField(namespaceTag, endStringToken, string);
    }

    public static List<String> parseDecisionName(final String string) {
        String subContent = string;

        List<String> dmnDecisionNames = new ArrayList<>();

        if (string != null && !string.isEmpty()) {
            do {
                int initialIndex = subContent.indexOf(decisionNameStartTag);
                if (initialIndex == -1) {
                    break;
                }
                subContent = subContent.substring(initialIndex);
                String decisionNameValue = parseField(decisionNameTag, endStringToken, subContent);

                if (decisionNameValue.isEmpty()) { // could not parseField
                    break;
                }
                dmnDecisionNames.add(decisionNameValue);
                subContent = subContent.substring(subContent.indexOf(decisionNameValue) + decisionNameValue.length());
            } while (true);
        }
        return dmnDecisionNames;

    }

    public static String parseDMNModelName(final String content) {
        return parseField("name=\"", "\"", content);
    }

}
