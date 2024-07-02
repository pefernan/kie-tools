package org.kie.kogito.async;

import jakarta.enterprise.context.ApplicationScoped;
import org.kie.kogito.async.handler.HRAsyncWorkItemHandler;
import org.kie.kogito.process.impl.DefaultWorkItemHandlerConfig;

@ApplicationScoped
public class CustomWorkItemHandlerConfig extends DefaultWorkItemHandlerConfig {
    {
        register("HRAsyncVerification", new HRAsyncWorkItemHandler());
    }
}
