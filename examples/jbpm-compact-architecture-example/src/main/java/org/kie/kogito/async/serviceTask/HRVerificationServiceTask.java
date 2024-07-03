package org.kie.kogito.async.serviceTask;

import io.smallrye.mutiny.Uni;
import io.vertx.core.Vertx;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import jakarta.enterprise.context.ApplicationScoped;
import org.kie.kogito.async.service.VerificationData;
import org.kie.kogito.hr.VerificationResponse;
import org.kie.kogito.hr.CandidateData;
import org.kie.kogito.hr.Offer;

import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class HRVerificationServiceTask {

    public VerificationResponse execute(CandidateData candidate, Offer offer) {
        VerificationData data = new VerificationData(candidate.getExperience(), candidate.getSkills(), offer)  ;
        return Uni.createFrom().completionStage(WebClient.create(Vertx.vertx(),
                                new WebClientOptions()
                                        .setSsl(false)
                                        .setDefaultHost("localhost")
                                        .setDefaultPort(8080))
                        .post("/verification/hr")
                        .putHeader("content-type", "application/json")
                        .sendJson(data)
                        .toCompletionStage())
                .map(response -> {
                    Map<String, Object> results = new HashMap<>();

                    if(response.statusCode() == 200) {
                        System.out.println("Candidate " + candidate.getName() + " HR validated");
                        return response.bodyAsJson(VerificationResponse.class);
                    }
                    return new VerificationResponse("HR Verification failure: " + response.statusMessage(), false);
                })
                .await()
                .indefinitely();
    }
}
