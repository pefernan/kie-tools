package org.jbpm.quarkus.devui.runtime.rpc;

import io.smallrye.mutiny.Multi;
import io.vertx.ext.web.client.WebClient;
import io.vertx.mutiny.core.Vertx;

public class DataIndexCounter {
    private Multi<String> multi;
    String query;
    String graphname;
    private WebClient dataIndexWebClient;
    private JBPMDevUIEventPublisher eventPublisher;

    public DataIndexCounter(String query, String graphname, WebClient dataIndexWebClient) {
        this.query = query;
        this.graphname = graphname;
        this.dataIndexWebClient = dataIndexWebClient;


        // register to eventPublisher
        //this.multi = Multi.createFrom().emitter(emiter -> ...);

        //
        //        Vertx vertx = Vertx.vertx();
        //
        //        vertx.setTimer(1000, refresh)
    }

    Multi<String> getMulti() {
        return multi;
    }
}
