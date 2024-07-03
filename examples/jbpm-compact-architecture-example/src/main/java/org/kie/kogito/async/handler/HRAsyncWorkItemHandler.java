package org.kie.kogito.async.handler;

import io.vertx.core.Vertx;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import org.kie.kogito.async.service.VerificationData;
import org.kie.kogito.hr.VerificationResponse;
import org.kie.kogito.hr.CandidateData;
import org.kie.kogito.hr.Offer;
import org.kie.kogito.internal.process.runtime.KogitoWorkItem;
import org.kie.kogito.internal.process.runtime.KogitoWorkItemHandler;
import org.kie.kogito.internal.process.runtime.KogitoWorkItemManager;

import java.util.Map;

public class HRAsyncWorkItemHandler implements KogitoWorkItemHandler {
    @Override
    public void executeWorkItem(KogitoWorkItem workItem, KogitoWorkItemManager manager) {
        CandidateData candidate = (CandidateData) workItem.getParameter("candidate");
        Offer offer = (Offer) workItem.getParameter("offer");
        VerificationData data = new VerificationData(candidate.getExperience(), candidate.getSkills(), offer)  ;

        WebClient.create(Vertx.vertx(),
                        new WebClientOptions()
                                .setSsl(false)
                                .setDefaultHost("localhost")
                                .setDefaultPort(8080))
                .post("/verification/hr")
                .putHeader("content-type", "application/json")
                .sendJson(data)
                .onSuccess(response -> {
                    if(response.statusCode() == 200) {
                        System.out.println("Candidate " + candidate.getName() + " HR validated");
                        VerificationResponse verificationResponse = response.bodyAsJson(VerificationResponse.class);
                        manager.completeWorkItem(workItem.getStringId(), Map.of("approved", verificationResponse.isApproved(), "comment", verificationResponse.getComment()));
                    } else {
                        System.out.println("Couldn't evaluate the candidate " + candidate.getName() + ": " + response);
                        manager.abortWorkItem(workItem.getStringId());                        }
                })
                .onFailure(response -> {
                    System.out.println("Couldn't evaluate the candidate " + candidate.getName() + ": " + response);
                    manager.abortWorkItem(workItem.getStringId());
                });
    }

    @Override
    public void abortWorkItem(KogitoWorkItem workItem, KogitoWorkItemManager manager) {
        System.err.println("Aborting HR work item " + workItem.getStringId());
    }
}
