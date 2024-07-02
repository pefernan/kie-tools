package org.kie.kogito.async.service;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.apache.commons.lang3.stream.Streams;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.kie.kogito.process.ProcessInstance;

import java.util.Optional;

@Path("/verification")
@org.eclipse.microprofile.openapi.annotations.tags.Tag(name = "tes")
@jakarta.enterprise.context.ApplicationScoped()
public class VerificationServiceResource {

    @POST
    @Path("hr")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "hr", description = "")
    public Response hrVerification(@Context UriInfo uriInfo, @jakarta.validation.Valid() @jakarta.validation.constraints.NotNull() VerificationData data) {

        VerificationResponse verification;
        if(data.getExperience() < 3) {
            verification = new VerificationResponse("HR Not recommended - Not enough experienced by offer", false);
        } else if(data.getOffer().getSalary() > 60000) {
            verification = new VerificationResponse("HR Not recommended - Salary too high", false);
        } else {
            verification = new VerificationResponse("HR Recommended!", true);
        }
        return Response.ok().entity(verification).build();
    }

    @POST
    @Path("it")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "it", description = "")
    public Response itVerification(@Context UriInfo uriInfo, @jakarta.validation.Valid() @jakarta.validation.constraints.NotNull() VerificationData data) {

        VerificationResponse verification;

        Optional<String> javaSkill = data.getSkills().stream()
                .filter(skill -> skill.equalsIgnoreCase("java"))
                .findFirst();

        if (javaSkill.isEmpty()) {
            verification = new VerificationResponse("IT - Java Skill Required", false);
        } else {
            verification = new VerificationResponse("IT - meets all skills", true);
        }
        return Response.ok().entity(verification).build();
    }
}

