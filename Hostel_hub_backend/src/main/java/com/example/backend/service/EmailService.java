package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@hostel.com}")
    private String fromEmail;

    public void sendVerificationOtp(String to, String otp) {
        String subject = "Hostel Registration OTP";
        String body = "Your OTP for Hostel Registration is: " + otp + "\n" +
                "This code is valid for 5 minutes. Please do not share this code with anyone.";

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom(fromEmail);
                mailSender.send(message);
                System.out.println("[EmailService] OTP sent successfully to " + to);
            } catch (Exception e) {
                System.err.println("[EmailService] FAILED to send email to " + to + ". Error: " + e.getMessage());
                System.err.println(
                        "[EmailService] Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "unknown"));
                System.out.println("=================================================");
                System.out.println("[CONSOLE FALLBACK] OTP for " + to + " is -> " + otp);
                System.out.println("=================================================");
                // Re-throw so the frontend gets an error and user knows email didn't send
                throw new RuntimeException("Failed to send OTP email. Please check your mail configuration.", e);
            }
        } else {
            System.out.println("[EmailService] JavaMailSender bean not found. Operating in console mode.");
            System.out.println("=================================================");
            System.out.println("[FALLBACK] OTP for " + to + " is -> " + otp);
            System.out.println("=================================================");
        }
    }
}
