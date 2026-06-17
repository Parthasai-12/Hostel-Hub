package com.example.backend.service;

import com.example.backend.config.RabbitMQConfig;
import com.example.backend.dto.ComplaintResolvedEvent;
import com.example.backend.dto.ComplaintStatusUpdateEvent;
import com.example.backend.dto.OtpEmailEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
public class EmailConsumer {

    private static final Logger log = LoggerFactory.getLogger(EmailConsumer.class);

    @Autowired
    private EmailService emailService;

    @RabbitHandler
    public void consumeOtpEvent(OtpEmailEvent event) {
        log.info("[EmailConsumer] Consuming OtpEmailEvent for email: {}", event.getEmail());
        try {
            emailService.sendVerificationOtp(event.getEmail(), event.getOtp());
            log.info("[EmailConsumer] Successfully processed OtpEmailEvent for: {}", event.getEmail());
        } catch (Exception e) {
            log.error("[EmailConsumer] Failed to send OTP email to {}. Error: {}", event.getEmail(), e.getMessage());
            // Rethrow exception to trigger spring-amqp listener retry and eventual DLQ routing
            throw e;
        }
    }

    @RabbitHandler
    public void consumeComplaintResolvedEvent(ComplaintResolvedEvent event) {
        log.info("[EmailConsumer] Consuming ComplaintResolvedEvent for complaint ID: {}", event.getComplaintId());
        try {
            emailService.sendResolutionEmailFromEvent(event);
            log.info("[EmailConsumer] Successfully processed ComplaintResolvedEvent for complaint ID: {}", event.getComplaintId());
        } catch (Exception e) {
            log.error("[EmailConsumer] Failed to send complaint resolution email for ID {}. Error: {}", event.getComplaintId(), e.getMessage());
            // Rethrow exception to trigger spring-amqp listener retry and eventual DLQ routing
            throw e;
        }
    }

    @RabbitHandler
    public void consumeComplaintStatusUpdateEvent(ComplaintStatusUpdateEvent event) {
        log.info("[EmailConsumer] Consuming ComplaintStatusUpdateEvent for complaint ID: {}", event.getComplaintId());
        try {
            emailService.sendStatusUpdateEmail(event);
            log.info("[EmailConsumer] Successfully processed ComplaintStatusUpdateEvent for complaint ID: {}", event.getComplaintId());
        } catch (Exception e) {
            log.error("[EmailConsumer] Failed to send complaint status update email for ID {}. Error: {}", event.getComplaintId(), e.getMessage());
            // Rethrow exception to trigger spring-amqp listener retry and eventual DLQ routing
            throw e;
        }
    }
}
