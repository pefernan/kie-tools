package org.kie.kogito.async.service;

import org.kie.kogito.hr.Offer;

import java.util.List;

public class VerificationData {
    private final Integer experience;
    private final List<String> skills;
    private final Offer offer;

    public VerificationData(Integer experience, List<String> skills, Offer offer) {
        this.experience = experience;
        this.skills = skills;
        this.offer = offer;
    }

    public Integer getExperience() {
        return experience;
    }

    public List<String> getSkills() {
        return skills;
    }

    public Offer getOffer() {
        return offer;
    }
}
