package org.kie.kogito.async.handler;

import io.vertx.mutiny.core.Vertx;
import io.vertx.mutiny.ext.web.client.WebClient;
import org.kie.api.runtime.process.WorkItem;
import org.kie.api.runtime.process.WorkItemHandler;
import org.kie.api.runtime.process.WorkItemManager;


public class AsyncWorkItemHandler implements WorkItemHandler {
    @Override
    public void executeWorkItem(WorkItem workItem, WorkItemManager manager) {
        new Thread(new Runnable() {
            public void run() {
                Vertx.vertx();
                WebClient.create(Vertx.vertx()).post("http://localhost:8080/v/")
                // Do the heavy lifting here ...
            }
        }).start();
    }

    @Override
    public void abortWorkItem(WorkItem workItem, WorkItemManager manager) {
        manager.abortWorkItem(workItem.getId());
    }
}
