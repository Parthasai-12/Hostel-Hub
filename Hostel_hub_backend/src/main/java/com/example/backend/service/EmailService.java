package com.example.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@hostel.com}")
    private String fromEmail;

    public void sendVerificationOtp(String to, String otp) {
        String subject = "Hostel Registration OTP";
        String body = "Your OTP for Hostel Registration is: " + otp + "\n" +
                "This code is valid for 5 minutes. Please do not share this code with anyone.";

        log.info("[EmailService] Attempting to send OTP email to: {}", to);
        log.debug("[EmailService] From: {}, Subject: {}", fromEmail, subject);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom(fromEmail);
            mailSender.send(message);
            log.info("[EmailService] ✅ OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("[EmailService] ❌ FAILED to send OTP email to: {}", to);
            log.error("[EmailService] Error: {}", e.getMessage());
            log.error("[EmailService] Cause: {}", e.getCause() != null ? e.getCause().getMessage() : "unknown");
            log.debug("[EmailService] Full stack trace:", e);
            // Rethrow so the controller returns an error to the frontend
            throw new RuntimeException("Failed to send OTP email. Please check SMTP configuration.", e);
        }
    }
}
