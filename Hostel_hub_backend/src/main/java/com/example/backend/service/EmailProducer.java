package com.example.backend.service;

import com.example.backend.config.RabbitMQConfig;
import com.example.backend.dto.ComplaintResolvedEvent;
import com.example.backend.dto.OtpEmailEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailProducer {

    private static final Logger log = LoggerFactory.getLogger(EmailProducer.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void publishOtpEvent(OtpEmailEvent event) {
        log.info("[EmailProducer] Publishing OTP event for email: {}", event.getEmail());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, event);
    }

    public void publishComplaintResolvedEvent(ComplaintResolvedEvent event) {
        log.info("[EmailProducer] Publishing Complaint Resolved event for complaint ID: {}", event.getComplaintId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, event);
    }
}
