package org.kie.kogito.async.service;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.kie.kogito.process.ProcessInstance;

import java.util.Optional;

@Path("/test")
@org.eclipse.microprofile.openapi.annotations.tags.Tag(name = "tes")
@jakarta.enterprise.context.ApplicationScoped()
public class TestServiceResource {

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "execute", description = "")
    public Response execute(@Context HttpHeaders httpHeaders, @Context UriInfo uriInfo, @QueryParam("businessKey") @DefaultValue("") String businessKey, @jakarta.validation.Valid() @jakarta.validation.constraints.NotNull() HiringModelInput resource) {
        ProcessInstance<HiringModel>
                pi = processService.createProcessInstance(process, businessKey, Optional.ofNullable(resource).orElse(new HiringModelInput()).toModel(), httpHeaders.getRequestHeaders(), httpHeaders.getHeaderString("X-KOGITO-StartFromNode"));
        return Response.created(uriInfo.getAbsolutePathBuilder().path(pi.id()).build()).entity(pi.checkError().variables().toModel()).build();
    }
}
