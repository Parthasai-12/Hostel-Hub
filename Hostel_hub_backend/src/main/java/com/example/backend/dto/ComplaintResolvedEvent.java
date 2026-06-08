package com.example.backend.dto;

import java.io.Serializable;
import java.util.List;

public class ComplaintResolvedEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long complaintId;
    private String title;
    private String category;
    private String resolvedOn;
    private String remarks;
    private List<RecipientInfo> recipients;

    public ComplaintResolvedEvent() {}

    public ComplaintResolvedEvent(Long complaintId, String title, String category, String resolvedOn, String remarks, List<RecipientInfo> recipients) {
        this.complaintId = complaintId;
        this.title = title;
        this.category = category;
        this.resolvedOn = resolvedOn;
        this.remarks = remarks;
        this.recipients = recipients;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getResolvedOn() {
        return resolvedOn;
    }

    public void setResolvedOn(String resolvedOn) {
        this.resolvedOn = resolvedOn;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public List<RecipientInfo> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<RecipientInfo> recipients) {
        this.recipients = recipients;
    }

    @Override
    public String toString() {
        return "ComplaintResolvedEvent{" +
                "complaintId=" + complaintId +
                ", title='" + title + '\'' +
                ", category='" + category + '\'' +
                ", resolvedOn='" + resolvedOn + '\'' +
                ", remarks='" + remarks + '\'' +
                ", recipients=" + recipients +
                '}';
    }
}
