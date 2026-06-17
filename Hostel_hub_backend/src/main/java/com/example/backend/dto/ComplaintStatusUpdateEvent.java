package com.example.backend.dto;

import java.io.Serializable;
import java.util.List;

public class ComplaintStatusUpdateEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long complaintId;
    private String title;
    private String status;
    private String expectedResolution;
    private String message;
    private List<RecipientInfo> recipients;

    public ComplaintStatusUpdateEvent() {}

    public ComplaintStatusUpdateEvent(Long complaintId, String title, String status, String expectedResolution, String message, List<RecipientInfo> recipients) {
        this.complaintId = complaintId;
        this.title = title;
        this.status = status;
        this.expectedResolution = expectedResolution;
        this.message = message;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getExpectedResolution() {
        return expectedResolution;
    }

    public void setExpectedResolution(String expectedResolution) {
        this.expectedResolution = expectedResolution;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<RecipientInfo> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<RecipientInfo> recipients) {
        this.recipients = recipients;
    }

    @Override
    public String toString() {
        return "ComplaintStatusUpdateEvent{" +
                "complaintId=" + complaintId +
                ", title='" + title + '\'' +
                ", status='" + status + '\'' +
                ", expectedResolution='" + expectedResolution + '\'' +
                ", message='" + message + '\'' +
                ", recipients=" + recipients +
                '}';
    }
}
