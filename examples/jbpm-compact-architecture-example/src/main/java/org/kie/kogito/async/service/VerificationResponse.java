package org.kie.kogito.async.service;

public class VerificationResponse {
    private final String comment;
    private final boolean approved;

    public VerificationResponse(String comment, boolean approved) {
        this.comment = comment;
        this.approved = approved;
    }

    public String getComment() {
        return comment;
    }

    public boolean isApproved() {
        return approved;
    }
}
