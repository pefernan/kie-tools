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

import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class DMNParsingUtilsTest {

    private static String dmnFile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?> <dmn:definitions xmlns:dmn=\"http://www.omg.org/spec/DMN/20180521/MODEL/\" xmlns=\"https://kiegroup.org/dmn/_57B8BED3-0077-4154-8435-30E57EA6F02E\" xmlns:feel=\"http://www.omg.org/spec/DMN/20180521/FEEL/\" xmlns:kie=\"http://www.drools.org/kie/dmn/1.2\" xmlns:dmndi=\"http://www.omg.org/spec/DMN/20180521/DMNDI/\" xmlns:di=\"http://www.omg.org/spec/DMN/20180521/DI/\" xmlns:dc=\"http://www.omg.org/spec/DMN/20180521/DC/\" id=\"_69FF465F-72D8-4541-9916-99174CC60EDC\" name=\"My Model Name\" typeLanguage=\"http://www.omg.org/spec/DMN/20180521/FEEL/\" namespace=\"https://kiegroup.org/dmn/_57B8BED3-0077-4154-8435-30E57EA6F02E\"> <dmn:extensionElements/> <dmn:decision id=\"_DBFC1810-89DF-4FD8-9D42-2C87C29354AC\" name=\"Decision-1\"> <dmn:extensionElements/> <dmn:variable id=\"_17C7D2CE-047B-46A8-A2DC-3C3256EDA5E7\" name=\"Decision-1\"/> </dmn:decision> <dmn:decision id=\"_49CDEC14-8D60-408A-9EAB-523E59E2FFAF\" name=\"Decision-2\"> <dmn:extensionElements/> <dmn:variable id=\"_A5ECF5B2-278B-487D-A9F4-0C3DF2C25042\" name=\"Decision-2\"/> <dmn:informationRequirement id=\"_E69C6AD0-0BBA-4126-8C0C-7C7381646EEA\"> <dmn:requiredDecision href=\"#_DBFC1810-89DF-4FD8-9D42-2C87C29354AC\"/> </dmn:informationRequirement> </dmn:decision> <dmn:decision id=\"_52F81D8D-5FA7-4300-A855-C8CE88D4B825\" name=\"Decision-3\"> <dmn:extensionElements/> <dmn:variable id=\"_BD33A344-7F8F-4B18-9535-7ED4041664CB\" name=\"Decision-3\"/> <dmn:informationRequirement id=\"_97E802F2-AFE9-4461-A575-6D8A3B05FD55\"> <dmn:requiredDecision href=\"#_49CDEC14-8D60-408A-9EAB-523E59E2FFAF\"/> </dmn:informationRequirement> </dmn:decision> <dmndi:DMNDI> <dmndi:DMNDiagram id=\"_B708E43A-EB44-4DAB-8098-0883E470865F\" name=\"DRG\"> <di:extension> <kie:ComponentsWidthsExtension/> </di:extension> <dmndi:DMNShape id=\"dmnshape-drg-_DBFC1810-89DF-4FD8-9D42-2C87C29354AC\" dmnElementRef=\"_DBFC1810-89DF-4FD8-9D42-2C87C29354AC\" isCollapsed=\"false\"> <dmndi:DMNStyle><dmndi:FillColor red=\"255\" green=\"255\" blue=\"255\"/><dmndi:StrokeColor red=\"0\" green=\"0\" blue=\"0\"/><dmndi:FontColor red=\"0\" green=\"0\" blue=\"0\"/></dmndi:DMNStyle><dc:Bounds x=\"130\" y=\"126\" width=\"100\" height=\"50\"/><dmndi:DMNLabel/></dmndi:DMNShape><dmndi:DMNShape id=\"dmnshape-drg-_49CDEC14-8D60-408A-9EAB-523E59E2FFAF\" dmnElementRef=\"_49CDEC14-8D60-408A-9EAB-523E59E2FFAF\" isCollapsed=\"false\"><dmndi:DMNStyle><dmndi:FillColor red=\"255\" green=\"255\" blue=\"255\"/><dmndi:StrokeColor red=\"0\" green=\"0\" blue=\"0\"/><dmndi:FontColor red=\"0\" green=\"0\" blue=\"0\"/></dmndi:DMNStyle><dc:Bounds x=\"130\" y=\"-4\" width=\"100\" height=\"50\"/><dmndi:DMNLabel/></dmndi:DMNShape><dmndi:DMNShape id=\"dmnshape-drg-_52F81D8D-5FA7-4300-A855-C8CE88D4B825\" dmnElementRef=\"_52F81D8D-5FA7-4300-A855-C8CE88D4B825\" isCollapsed=\"false\"><dmndi:DMNStyle><dmndi:FillColor red=\"255\" green=\"255\" blue=\"255\"/><dmndi:StrokeColor red=\"0\" green=\"0\" blue=\"0\"/><dmndi:FontColor red=\"0\" green=\"0\" blue=\"0\"/></dmndi:DMNStyle><dc:Bounds x=\"130\" y=\"-134\" width=\"100\" height=\"50\"/><dmndi:DMNLabel/></dmndi:DMNShape><dmndi:DMNEdge id=\"dmnedge-drg-_E69C6AD0-0BBA-4126-8C0C-7C7381646EEA-AUTO-SOURCE-AUTO-TARGET\" dmnElementRef=\"_E69C6AD0-0BBA-4126-8C0C-7C7381646EEA\"><di:waypoint x=\"180\" y=\"126\"/><di:waypoint x=\"180\" y=\"46\"/></dmndi:DMNEdge><dmndi:DMNEdge id=\"dmnedge-drg-_97E802F2-AFE9-4461-A575-6D8A3B05FD55-AUTO-SOURCE-AUTO-TARGET\" dmnElementRef=\"_97E802F2-AFE9-4461-A575-6D8A3B05FD55\"><di:waypoint x=\"180\" y=\"-4\"/><di:waypoint x=\"180\" y=\"-84\"/></dmndi:DMNEdge></dmndi:DMNDiagram></dmndi:DMNDI></dmn:definitions>";

    @Test
    public void testParseNamespaceSuccess() {
        String namespace = DMNParsingUtils.parseNamespace(dmnFile);
        assert(namespace.equals("https://kiegroup.org/dmn/_57B8BED3-0077-4154-8435-30E57EA6F02E"));
    }

    @Test
    public void testParseNamespaceFailure() {
        //Empty content
        String namespace = DMNParsingUtils.parseNamespace("");
        assert(namespace.equals(""));

        //Not ending in quotes
        namespace = DMNParsingUtils.parseNamespace("namespace=\"https://kiegroup.org/dmn/_57B8BED3-0077-4154-8435-30E57EA6F02E");
        assert(namespace.equals(""));
    }

    @Test
    public void testParseDecisionName() {
        List<String> desisionName = DMNParsingUtils.parseDecisionName(dmnFile);
        assert(desisionName.size() == 3);
        assert(desisionName.get(0).equals("Decision-1"));
        assert(desisionName.get(1).equals("Decision-2"));
        assert(desisionName.get(2).equals("Decision-3"));
    }

    @Test
    public void testParseDecisionNameFailure() {
        //Empty content
        List<String> decisionNames = DMNParsingUtils.parseDecisionName("");
        assert(decisionNames.size() == 0);

        //Not ending in quotes
        decisionNames = DMNParsingUtils.parseDecisionName("<dmn:decision id=\"_DBFC1810-89DF-4FD8-9D42-2C87C29354AC\" name=\"Decision-1");
        assert(decisionNames.size() == 0);
    }

    @Test
    public void testParseDMNModelNameSuccess() {
        String namespace = DMNParsingUtils.parseDMNModelName(dmnFile);
        assert(namespace.equals("My Model Name"));
    }

    @Test
    public void testParseDMNModelNameFailure() {
        //Empty content
        String dmnModelName = DMNParsingUtils.parseDMNModelName("");
        assert(dmnModelName.equals(""));

        //Not ending in quotes
        dmnModelName = DMNParsingUtils.parseDMNModelName("name=\"My Model Name");
        assert(dmnModelName.equals(""));
    }
}