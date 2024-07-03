package org.kie.kogito.hr;

import java.io.Serializable;

public class VerificationResponse implements Serializable {
    private String comment;
    private boolean approved;

    public VerificationResponse() {
    }

    public VerificationResponse(String comment, boolean approved) {
        this.comment = comment;
        this.approved = approved;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }
}
