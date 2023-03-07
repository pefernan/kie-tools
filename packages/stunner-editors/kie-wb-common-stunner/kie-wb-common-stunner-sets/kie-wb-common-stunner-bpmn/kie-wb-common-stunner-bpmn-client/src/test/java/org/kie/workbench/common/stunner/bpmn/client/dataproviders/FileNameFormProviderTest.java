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

package org.kie.workbench.common.stunner.bpmn.client.dataproviders;

import java.util.Optional;

import javax.enterprise.event.Event;

import elemental2.promise.Promise;
import org.appformer.kogito.bridge.client.resource.ResourceContentService;
import org.appformer.kogito.bridge.client.resource.interop.ResourceContentOptions;
import org.appformer.kogito.bridge.client.resource.interop.ResourceListOptions;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.kie.workbench.common.stunner.bpmn.definition.BusinessRuleTask;
import org.kie.workbench.common.stunner.bpmn.definition.property.task.BusinessRuleTaskExecutionSet;
import org.kie.workbench.common.stunner.core.api.DefinitionManager;
import org.kie.workbench.common.stunner.core.client.api.SessionManager;
import org.kie.workbench.common.stunner.core.client.canvas.AbstractCanvasHandler;
import org.kie.workbench.common.stunner.core.client.canvas.Canvas;
import org.kie.workbench.common.stunner.core.client.canvas.CanvasHandler;
import org.kie.workbench.common.stunner.core.client.canvas.controls.actions.TextPropertyProviderFactory;
import org.kie.workbench.common.stunner.core.client.canvas.listener.CanvasListener;
import org.kie.workbench.common.stunner.core.client.canvas.listener.HasCanvasListeners;
import org.kie.workbench.common.stunner.core.client.command.CanvasCommandFactory;
import org.kie.workbench.common.stunner.core.client.command.SessionCommandManager;
import org.kie.workbench.common.stunner.core.client.shape.MutationContext;
import org.kie.workbench.common.stunner.core.client.shape.Shape;
import org.kie.workbench.common.stunner.core.client.shape.factory.ShapeFactory;
import org.kie.workbench.common.stunner.core.diagram.Diagram;
import org.kie.workbench.common.stunner.core.graph.Element;
import org.kie.workbench.common.stunner.core.graph.content.definition.Definition;
import org.kie.workbench.common.stunner.core.graph.processing.index.Index;
import org.kie.workbench.common.stunner.core.rule.RuleManager;
import org.kie.workbench.common.stunner.core.rule.RuleSet;
import org.kie.workbench.common.stunner.forms.client.event.FormFieldChanged;
import org.kie.workbench.common.stunner.forms.client.event.RefreshFormPropertiesEvent;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.uberfire.client.promise.Promises;
import org.uberfire.mvp.ParameterizedCommand;
import org.uberfire.promise.SyncPromises;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class FileNameFormProviderTest {

    @Mock
    private Event<RefreshFormPropertiesEvent> refreshFormPropertiesEvent;

    @Mock
    private SessionManager sessionManager;

    @Mock
    private CanvasCommandFactory<AbstractCanvasHandler> canvasCommandFactory;

    @Mock
    private SessionCommandManager<AbstractCanvasHandler> sessionCommandManager;

    @Mock
    private Element<? extends Definition<?>> element;

    private AbstractCanvasHandler canvasHandler = new AbstractCanvasHandler() {
        @Override
        public DefinitionManager getDefinitionManager() {
            return null;
        }

        @Override
        public TextPropertyProviderFactory getTextPropertyProviderFactory() {
            return null;
        }

        @Override
        public RuleManager getRuleManager() {
            return null;
        }

        @Override
        public RuleSet getRuleSet() {
            return null;
        }

        @Override
        public Index<?, ?> getGraphIndex() {
            return null;
        }

        @Override
        public void addChild(Element parent, Element child) {

        }

        @Override
        public void addChild(Element parent, Element child, int index) {

        }

        @Override
        public void removeChild(Element parent, Element child) {

        }

        @Override
        public Optional<Element> getElementAt(double x, double y) {
            return Optional.empty();
        }

        @Override
        public boolean dock(Element parent, Element child) {
            return false;
        }

        @Override
        public void undock(Element parent, Element child) {

        }

        @Override
        public CanvasHandler doClear() {
            return null;
        }

        @Override
        public void doDestroy() {

        }

        @Override
        public void register(Shape shape, Element candidate, boolean fireEvents) {

        }

        @Override
        public void deregister(Shape shape, Element element, boolean fireEvents) {

        }

        @Override
        public void applyElementMutation(Shape shape, Element candidate, boolean applyPosition, boolean applyProperties, MutationContext mutationContext) {

        }

        @Override
        public ShapeFactory<Object, Shape> getShapeFactory(String shapeSetId) {
            return null;
        }

        @Override
        public CanvasHandler handle(Canvas canvas) {
            return null;
        }

        @Override
        public void draw(Diagram diagram, ParameterizedCommand loadCallback) {

        }

        @Override
        public Diagram getDiagram() {
            return null;
        }

        @Override
        public Canvas getCanvas() {
            return null;
        }

        @Override
        public HasCanvasListeners addRegistrationListener(CanvasListener instance) {
            return null;
        }

        @Override
        public HasCanvasListeners removeRegistrationListener(CanvasListener instance) {
            return null;
        }
    };

    private ResourceContentService resourceContentService;

    private Promises promises;

    private FileNameFormProvider tested;

    private static String dmnFile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?> <dmn:definitions xmlns:dmn=\"http://www.omg.org/spec/DMN/20180521/MODEL/\" xmlns=\"https://kiegroup.org/dmn/_57B8BED3-0077-4154-8435-30E57EA6F02E\" xmlns:feel=\"http://www.omg.org/spec/DMN/20180521/FEEL/\" xmlns:kie=\"http://www.drools.org/kie/dmn/1.2\" xmlns:dmndi=\"http://www.omg.org/spec/DMN/20180521/DMNDI/\" xmlns:di=\"http://www.omg.org/spec/DMN/20180521/DI/\" xmlns:dc=\"http://www.omg.org/spec/DMN/20180521/DC/\" id=\"_69FF465F-72D8-4541-9916-99174CC60EDC\" name=\"My Model Name\" typeLanguage=\"http://www.omg.org/spec/DMN/20180521/FEEL/\" namespace=\"https://kiegroup.org/dmn/_57B8BED3-0077-4154-8435-30E57EA6F02E\"> <dmn:extensionElements/> <dmn:decision id=\"_DBFC1810-89DF-4FD8-9D42-2C87C29354AC\" name=\"Decision-1\"> <dmn:extensionElements/> <dmn:variable id=\"_17C7D2CE-047B-46A8-A2DC-3C3256EDA5E7\" name=\"Decision-1\"/> </dmn:decision> <dmn:decision id=\"_49CDEC14-8D60-408A-9EAB-523E59E2FFAF\" name=\"Decision-2\"> <dmn:extensionElements/> <dmn:variable id=\"_A5ECF5B2-278B-487D-A9F4-0C3DF2C25042\" name=\"Decision-2\"/> <dmn:informationRequirement id=\"_E69C6AD0-0BBA-4126-8C0C-7C7381646EEA\"> <dmn:requiredDecision href=\"#_DBFC1810-89DF-4FD8-9D42-2C87C29354AC\"/> </dmn:informationRequirement> </dmn:decision> <dmn:decision id=\"_52F81D8D-5FA7-4300-A855-C8CE88D4B825\" name=\"Decision-3\"> <dmn:extensionElements/> <dmn:variable id=\"_BD33A344-7F8F-4B18-9535-7ED4041664CB\" name=\"Decision-3\"/> <dmn:informationRequirement id=\"_97E802F2-AFE9-4461-A575-6D8A3B05FD55\"> <dmn:requiredDecision href=\"#_49CDEC14-8D60-408A-9EAB-523E59E2FFAF\"/> </dmn:informationRequirement> </dmn:decision> <dmndi:DMNDI> <dmndi:DMNDiagram id=\"_B708E43A-EB44-4DAB-8098-0883E470865F\" name=\"DRG\"> <di:extension> <kie:ComponentsWidthsExtension/> </di:extension> <dmndi:DMNShape id=\"dmnshape-drg-_DBFC1810-89DF-4FD8-9D42-2C87C29354AC\" dmnElementRef=\"_DBFC1810-89DF-4FD8-9D42-2C87C29354AC\" isCollapsed=\"false\"> <dmndi:DMNStyle><dmndi:FillColor red=\"255\" green=\"255\" blue=\"255\"/><dmndi:StrokeColor red=\"0\" green=\"0\" blue=\"0\"/><dmndi:FontColor red=\"0\" green=\"0\" blue=\"0\"/></dmndi:DMNStyle><dc:Bounds x=\"130\" y=\"126\" width=\"100\" height=\"50\"/><dmndi:DMNLabel/></dmndi:DMNShape><dmndi:DMNShape id=\"dmnshape-drg-_49CDEC14-8D60-408A-9EAB-523E59E2FFAF\" dmnElementRef=\"_49CDEC14-8D60-408A-9EAB-523E59E2FFAF\" isCollapsed=\"false\"><dmndi:DMNStyle><dmndi:FillColor red=\"255\" green=\"255\" blue=\"255\"/><dmndi:StrokeColor red=\"0\" green=\"0\" blue=\"0\"/><dmndi:FontColor red=\"0\" green=\"0\" blue=\"0\"/></dmndi:DMNStyle><dc:Bounds x=\"130\" y=\"-4\" width=\"100\" height=\"50\"/><dmndi:DMNLabel/></dmndi:DMNShape><dmndi:DMNShape id=\"dmnshape-drg-_52F81D8D-5FA7-4300-A855-C8CE88D4B825\" dmnElementRef=\"_52F81D8D-5FA7-4300-A855-C8CE88D4B825\" isCollapsed=\"false\"><dmndi:DMNStyle><dmndi:FillColor red=\"255\" green=\"255\" blue=\"255\"/><dmndi:StrokeColor red=\"0\" green=\"0\" blue=\"0\"/><dmndi:FontColor red=\"0\" green=\"0\" blue=\"0\"/></dmndi:DMNStyle><dc:Bounds x=\"130\" y=\"-134\" width=\"100\" height=\"50\"/><dmndi:DMNLabel/></dmndi:DMNShape><dmndi:DMNEdge id=\"dmnedge-drg-_E69C6AD0-0BBA-4126-8C0C-7C7381646EEA-AUTO-SOURCE-AUTO-TARGET\" dmnElementRef=\"_E69C6AD0-0BBA-4126-8C0C-7C7381646EEA\"><di:waypoint x=\"180\" y=\"126\"/><di:waypoint x=\"180\" y=\"46\"/></dmndi:DMNEdge><dmndi:DMNEdge id=\"dmnedge-drg-_97E802F2-AFE9-4461-A575-6D8A3B05FD55-AUTO-SOURCE-AUTO-TARGET\" dmnElementRef=\"_97E802F2-AFE9-4461-A575-6D8A3B05FD55\"><di:waypoint x=\"180\" y=\"-4\"/><di:waypoint x=\"180\" y=\"-84\"/></dmndi:DMNEdge></dmndi:DMNDiagram></dmndi:DMNDI></dmn:definitions>";

    @Before
    public void setUp() {

        promises = new SyncPromises();
        resourceContentService = new ResourceContentService() {
            @Override
            public Promise<String> get(String uri) {
                String returnContent = uri.equals("File1.dmn") ? dmnFile : "";
                return promises.resolve(returnContent);
            }

            @Override
            public Promise<String> get(String uri, ResourceContentOptions options) {
                return get(uri);
            }

            @Override
            public Promise<String[]> list(String pattern) {
                return promises.resolve(new String[] { "File1.dmn", "File2.dmn", "File3.dmn", "File4.dmn", "File5.dmn" });
            }

            @Override
            public Promise<String[]> list(String pattern, ResourceListOptions options) {
                return list(pattern);
            }
        };

        tested = new FileNameFormProvider();
        tested.setInit(refreshFormPropertiesEvent, sessionManager, canvasCommandFactory, sessionCommandManager, resourceContentService, promises);
    }

    @Test
    public void testFetchFilenames() {
        tested.fetchFileNames();
        assert(tested.getFileNames().size() == 5);
        assert(tested.getFileNames().containsKey("File1.dmn"));
        assert(tested.getFileNames().containsKey("File2.dmn"));
        assert(tested.getFileNames().containsKey("File3.dmn"));
        assert(tested.getFileNames().containsKey("File4.dmn"));
        assert(tested.getFileNames().containsKey("File5.dmn"));

        verify(refreshFormPropertiesEvent, times(1)).fire(any(RefreshFormPropertiesEvent.class));
    }

    @Test
    public void testFetchFile() {
        tested.setElement(element);
        tested.setCanvasHandler(canvasHandler);
        tested.fetchFile("File1.dmn");
        testFilenameContent();
    }

    private void testFilenameContent() {
        assert(tested.getNamespace().equals("https://kiegroup.org/dmn/_57B8BED3-0077-4154-8435-30E57EA6F02E"));
        assert(tested.getDecisionName().size() == 3);
        assert(tested.getDecisionName().get(0).equals("Decision-1"));
        assert(tested.getDecisionName().get(1).equals("Decision-2"));
        assert(tested.getDecisionName().get(2).equals("Decision-3"));
        assert(tested.getDmnModelName().equals("My Model Name"));

        verify(canvasCommandFactory, times(1)).updatePropertyValue(element, BusinessRuleTask.EXECUTION_SET + "."
                + BusinessRuleTaskExecutionSet.NAMESPACE, tested.getNamespace());
        verify(canvasCommandFactory, times(1)).updatePropertyValue(element, BusinessRuleTask.EXECUTION_SET + "."
                + BusinessRuleTaskExecutionSet.DECISON_NAME, "");
        verify(canvasCommandFactory, times(1)).updatePropertyValue(element, BusinessRuleTask.EXECUTION_SET + "."
                + BusinessRuleTaskExecutionSet.DMN_MODEL_NAME, tested.getDmnModelName());
    }

    @Test
    public void testOnFormFieldChanged() {
        tested.fetchFileNames();
        FormFieldChanged formFieldChanged = new FormFieldChanged(BusinessRuleTask.EXECUTION_SET + "." + BusinessRuleTaskExecutionSet.FILE_NAME, "File1.dmn", "1234");
        tested.setElement(element);
        tested.setCanvasHandler(canvasHandler);
        tested.onFormFieldChanged(formFieldChanged);
        verify(refreshFormPropertiesEvent, times(2)).fire(any(RefreshFormPropertiesEvent.class));
        testFilenameContent();
        // New File not fetched before
        formFieldChanged = new FormFieldChanged(BusinessRuleTask.EXECUTION_SET + "." + BusinessRuleTaskExecutionSet.FILE_NAME, "NewFile.dmn", "5678");
        tested.onFormFieldChanged(formFieldChanged);
        assert(tested.getNamespace().equals(""));
        assert(tested.getDecisionName().size() == 0);
        assert(tested.getDmnModelName().equals(""));

        verify(canvasCommandFactory, times(1)).updatePropertyValue(element, BusinessRuleTask.EXECUTION_SET + "."
                + BusinessRuleTaskExecutionSet.NAMESPACE, "");
        verify(canvasCommandFactory, times(2)).updatePropertyValue(element, BusinessRuleTask.EXECUTION_SET + "."
                + BusinessRuleTaskExecutionSet.DECISON_NAME, "");
        verify(canvasCommandFactory, times(1)).updatePropertyValue(element, BusinessRuleTask.EXECUTION_SET + "."
                + BusinessRuleTaskExecutionSet.DMN_MODEL_NAME, "");

        verify(refreshFormPropertiesEvent, times(3)).fire(any(RefreshFormPropertiesEvent.class));
    }
}