package com.example.backend.dto;

public class FailedEmailInfo {
    private String messageId;
    private String emailRecipient;
    private String emailType;
    private String failureReason;
    private long failedTimestamp;
    private int retryCount;
    private String messagePayload;

    public FailedEmailInfo() {}

    public FailedEmailInfo(String messageId, String emailRecipient, String emailType, String failureReason, long failedTimestamp, int retryCount, String messagePayload) {
        this.messageId = messageId;
        this.emailRecipient = emailRecipient;
        this.emailType = emailType;
        this.failureReason = failureReason;
        this.failedTimestamp = failedTimestamp;
        this.retryCount = retryCount;
        this.messagePayload = messagePayload;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getEmailRecipient() {
        return emailRecipient;
    }

    public void setEmailRecipient(String emailRecipient) {
        this.emailRecipient = emailRecipient;
    }

    public String getEmailType() {
        return emailType;
    }

    public void setEmailType(String emailType) {
        this.emailType = emailType;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public long getFailedTimestamp() {
        return failedTimestamp;
    }

    public void setFailedTimestamp(long failedTimestamp) {
        this.failedTimestamp = failedTimestamp;
    }

    public int getRetryCount() {
        return retryCount;
    }

    public void setRetryCount(int retryCount) {
        this.retryCount = retryCount;
    }

    public String getMessagePayload() {
        return messagePayload;
    }

    public void setMessagePayload(String messagePayload) {
        this.messagePayload = messagePayload;
    }

    @Override
    public String toString() {
        return "FailedEmailInfo{" +
                "messageId='" + messageId + '\'' +
                ", emailRecipient='" + emailRecipient + '\'' +
                ", emailType='" + emailType + '\'' +
                ", failureReason='" + failureReason + '\'' +
                ", failedTimestamp=" + failedTimestamp +
                ", retryCount=" + retryCount +
                ", messagePayload='" + messagePayload + '\'' +
                '}';
    }
}
