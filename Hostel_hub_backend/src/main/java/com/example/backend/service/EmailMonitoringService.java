package com.example.backend.service;

import com.example.backend.config.RabbitMQConfig;
import com.example.backend.dto.ComplaintResolvedEvent;
import com.example.backend.dto.FailedEmailInfo;
import com.example.backend.dto.OtpEmailEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.GetResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.connection.Connection;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

@Service
public class EmailMonitoringService {

    private static final Logger log = LoggerFactory.getLogger(EmailMonitoringService.class);

    @Autowired
    private ConnectionFactory connectionFactory;

    @Autowired
    private RabbitAdmin rabbitAdmin;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmailProducer emailProducer;

    /**
     * Get the count of failed messages in the Dead Letter Queue.
     */
    public int getFailedEmailCount() {
        Properties props = rabbitAdmin.getQueueProperties(RabbitMQConfig.DLQ_NAME);
        if (props != null) {
            Object countObj = props.get(RabbitAdmin.QUEUE_MESSAGE_COUNT);
            if (countObj instanceof Number) {
                return ((Number) countObj).intValue();
            }
        }
        return 0;
    }

    /**
     * Get all failed emails from the Dead Letter Queue (peeking).
     */
    public List<FailedEmailInfo> getFailedEmails(int limit) {
        List<FailedEmailInfo> list = new ArrayList<>();
        Connection connection = connectionFactory.createConnection();
        Channel channel = connection.createChannel(false);
        try {
            for (int i = 0; i < limit; i++) {
                GetResponse response = channel.basicGet(RabbitMQConfig.DLQ_NAME, false);
                if (response == null) {
                    break;
                }
                FailedEmailInfo info = parseGetResponse(response);
                list.add(info);
            }
        } catch (Exception e) {
            log.error("Failed to fetch DLQ messages", e);
            throw new RuntimeException("Failed to read messages from DLQ", e);
        } finally {
            try {
                if (channel != null && channel.isOpen()) {
                    channel.close();
                }
                if (connection != null && connection.isOpen()) {
                    connection.close();
                }
            } catch (Exception e) {
                // Ignore closing exceptions
            }
        }
        return list;
    }

    /**
     * Get detailed information for a specific failed message in the DLQ.
     */
    public FailedEmailInfo getFailedEmailDetails(String messageId) {
        Connection connection = connectionFactory.createConnection();
        Channel channel = connection.createChannel(false);
        try {
            while (true) {
                GetResponse response = channel.basicGet(RabbitMQConfig.DLQ_NAME, false);
                if (response == null) {
                    break;
                }
                FailedEmailInfo info = parseGetResponse(response);
                if (info.getMessageId().equals(messageId)) {
                    return info;
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch DLQ message details for ID: {}", messageId, e);
            throw new RuntimeException("Failed to read message details from DLQ", e);
        } finally {
            try {
                if (channel != null && channel.isOpen()) {
                    channel.close();
                }
                if (connection != null && connection.isOpen()) {
                    connection.close();
                }
            } catch (Exception e) {
                // Ignore
            }
        }
        return null;
    }

    /**
     * Resend a failed email by consuming it from the DLQ and republishing it to the main queue.
     */
    public boolean resendFailedEmail(String messageId) {
        log.info("[EmailMonitoringService] Resend attempt initiated for messageId: {}", messageId);
        Connection connection = connectionFactory.createConnection();
        Channel channel = connection.createChannel(false);
        boolean found = false;
        try {
            // We read through the DLQ. If we find the target message, we republish it and acknowledge it (ack).
            // All other messages remain unacknowledged and are automatically requeued when the channel closes.
            while (true) {
                GetResponse response = channel.basicGet(RabbitMQConfig.DLQ_NAME, false);
                if (response == null) {
                    break;
                }
                FailedEmailInfo info = parseGetResponse(response);
                if (info.getMessageId().equals(messageId)) {
                    try {
                        republishMessage(info);
                        channel.basicAck(response.getEnvelope().getDeliveryTag(), false);
                        found = true;
                        log.info("[EmailMonitoringService] Successful resend for messageId: {}", messageId);
                    } catch (Exception e) {
                        log.error("[EmailMonitoringService] Failed resend for messageId: {}. Error during republish: {}", messageId, e.getMessage());
                        // If republish fails, we leave the message in the DLQ (don't ack/reject, let it auto-requeue)
                        throw e;
                    }
                    break;
                }
            }
            if (!found) {
                log.error("[EmailMonitoringService] Failed resend for messageId: {} (Message not found in DLQ)", messageId);
            }
        } catch (Exception e) {
            log.error("[EmailMonitoringService] Failed resend for messageId: {}. Error: {}", messageId, e.getMessage());
            throw new RuntimeException("Failed to resend DLQ message", e);
        } finally {
            try {
                if (channel != null && channel.isOpen()) {
                    channel.close();
                }
                if (connection != null && connection.isOpen()) {
                    connection.close();
                }
            } catch (Exception e) {
                // Ignore
            }
        }
        return found;
    }

    private void republishMessage(FailedEmailInfo info) throws Exception {
        if ("OTP".equalsIgnoreCase(info.getEmailType())) {
            OtpEmailEvent event = objectMapper.readValue(info.getMessagePayload(), OtpEmailEvent.class);
            emailProducer.publishOtpEvent(event);
        } else if ("Complaint Resolution".equalsIgnoreCase(info.getEmailType())) {
            ComplaintResolvedEvent event = objectMapper.readValue(info.getMessagePayload(), ComplaintResolvedEvent.class);
            emailProducer.publishComplaintResolvedEvent(event);
        } else {
            throw new IllegalArgumentException("Unknown email type: " + info.getEmailType());
        }
    }

    private FailedEmailInfo parseGetResponse(GetResponse response) {
        byte[] body = response.getBody();
        String payload = new String(body, StandardCharsets.UTF_8);
        AMQP.BasicProperties props = response.getProps();
        Map<String, Object> headers = props.getHeaders();

        String messageId = props.getMessageId();
        if (messageId == null) {
            // Fallback: use deterministic UUID based on payload bytes if messageId is missing
            messageId = java.util.UUID.nameUUIDFromBytes(body).toString();
        }

        String emailRecipient = "Unknown";
        String emailType = "Unknown";

        try {
            JsonNode node = objectMapper.readTree(payload);
            if (node.has("otp")) {
                emailType = "OTP";
                if (node.has("email")) {
                    emailRecipient = node.get("email").asText();
                }
            } else if (node.has("complaintId")) {
                emailType = "Complaint Resolution";
                if (node.has("recipients") && node.get("recipients").isArray()) {
                    List<String> emails = new ArrayList<>();
                    for (JsonNode recNode : node.get("recipients")) {
                        if (recNode.has("email")) {
                            emails.add(recNode.get("email").asText());
                        }
                    }
                    emailRecipient = String.join(", ", emails);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse JSON payload details for message: {}", messageId, e);
        }

        String failureReason = "Unknown exception during processing";
        if (headers != null) {
            if (headers.containsKey("x-exception-message")) {
                Object msgObj = headers.get("x-exception-message");
                if (msgObj != null) {
                    failureReason = msgObj.toString();
                }
            } else if (headers.containsKey("x-death")) {
                // If standard RabbitMQ dead-lettering added the x-death header
                Object xDeathObj = headers.get("x-death");
                if (xDeathObj instanceof List && !((List<?>) xDeathObj).isEmpty()) {
                    Object firstDeath = ((List<?>) xDeathObj).get(0);
                    if (firstDeath instanceof Map) {
                        Object reason = ((Map<?, ?>) firstDeath).get("reason");
                        if (reason != null) {
                            failureReason = "Dead lettered due to: " + reason.toString();
                        }
                    }
                }
            }
        }

        long failedTimestamp = System.currentTimeMillis();
        if (headers != null && headers.containsKey("x-failed-timestamp")) {
            Object timeObj = headers.get("x-failed-timestamp");
            if (timeObj instanceof Number) {
                failedTimestamp = ((Number) timeObj).longValue();
            } else if (timeObj != null) {
                try {
                    failedTimestamp = Long.parseLong(timeObj.toString());
                } catch (NumberFormatException nfe) {
                    // Ignore
                }
            }
        } else if (props.getTimestamp() != null) {
            failedTimestamp = props.getTimestamp().getTime();
        } else if (headers != null && headers.containsKey("x-death")) {
            Object xDeathObj = headers.get("x-death");
            if (xDeathObj instanceof List && !((List<?>) xDeathObj).isEmpty()) {
                Object firstDeath = ((List<?>) xDeathObj).get(0);
                if (firstDeath instanceof Map) {
                    Object timeObj = ((Map<?, ?>) firstDeath).get("time");
                    if (timeObj instanceof java.util.Date) {
                        failedTimestamp = ((java.util.Date) timeObj).getTime();
                    }
                }
            }
        }

        int retryCount = 3; // Default is 3 attempts based on simple retry configuration

        FailedEmailInfo info = new FailedEmailInfo();
        info.setMessageId(messageId);
        info.setEmailRecipient(emailRecipient);
        info.setEmailType(emailType);
        info.setFailureReason(failureReason);
        info.setFailedTimestamp(failedTimestamp);
        info.setRetryCount(retryCount);
        info.setMessagePayload(payload);

        return info;
    }

    /**
     * Peek at the entries in the Dead Letter Queue without destroying/consuming them.
     * Kept for backwards compatibility.
     */
    public List<String> getDeadLetterQueueEntries(int limit) {
        List<String> entries = new ArrayList<>();
        Connection connection = connectionFactory.createConnection();
        Channel channel = connection.createChannel(false);
        try {
            for (int i = 0; i < limit; i++) {
                GetResponse response = channel.basicGet(RabbitMQConfig.DLQ_NAME, false);
                if (response == null) {
                    break;
                }
                byte[] body = response.getBody();
                String json = new String(body, StandardCharsets.UTF_8);
                entries.add(json);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read messages from DLQ", e);
        } finally {
            try {
                if (channel != null && channel.isOpen()) {
                    channel.close();
                }
                if (connection != null && connection.isOpen()) {
                    connection.close();
                }
            } catch (Exception e) {
                // Ignore
            }
        }
        return entries;
    }
}
