package com.example.backend.service;

import com.example.backend.entity.Complaint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@hostel.com}")
    private String fromEmail;

    // -------------------------------------------------------------------------
    // OTP Email (existing — unchanged)
    // -------------------------------------------------------------------------
    public void sendVerificationOtp(String to, String otp) {
        String subject = "Hostel Registration OTP";
        String body = "Your OTP for Hostel Registration is: " + otp + "\n" +
                "This code is valid for 5 minutes. Please do not share this code with anyone.";

        log.info("[CONSOLE FALLBACK] OTP for {} -> {}", to, otp);
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                message.setFrom(fromEmail);
                mailSender.send(message);
                log.info("[EmailService] OTP sent successfully to {}", to);
            } catch (Exception e) {
                log.error("[EmailService] FAILED to send OTP to {}. Error: {}", to, e.getMessage());
                throw new RuntimeException("Failed to send OTP email. Please check your mail configuration.", e);
            }
        } else {
            log.warn("[EmailService] JavaMailSender not available — console fallback mode");
        }
    }

    // -------------------------------------------------------------------------
    // Resolution Notification Email (new — Feature 3)
    // -------------------------------------------------------------------------
    public void sendResolutionEmail(Complaint complaint, String remarks) {
        if (mailSender == null) {
            log.warn("[EmailService] JavaMailSender not available — skipping resolution emails for complaint id={}", complaint.getId());
            return;
        }

        log.info("[EmailService] Sending resolution emails for complaint id={} (reporter + {} affected students)", 
            complaint.getId(), complaint.getAffectedStudents() != null ? complaint.getAffectedStudents().size() : 0);

        // 1. Send to the original reporter
        sendSingleResolutionEmail(complaint, complaint.getUser(), remarks);

        // 2. Send to all affected students who were grouped
        if (complaint.getAffectedStudents() != null) {
            for (com.example.backend.entity.User student : complaint.getAffectedStudents()) {
                sendSingleResolutionEmail(complaint, student, remarks);
            }
        }
    }

    public void sendResolutionEmailFromEvent(com.example.backend.dto.ComplaintResolvedEvent event) {
        if (mailSender == null) {
            log.warn("[EmailService] JavaMailSender not available — skipping resolution emails from event for complaint id={}", event.getComplaintId());
            return;
        }

        log.info("[EmailService] Sending resolution emails from event for complaint id={} to {} recipients", 
            event.getComplaintId(), event.getRecipients() != null ? event.getRecipients().size() : 0);

        if (event.getRecipients() != null) {
            for (com.example.backend.dto.RecipientInfo recipient : event.getRecipients()) {
                sendSingleResolutionEmailFromEvent(event, recipient);
            }
        }
    }

    private void sendSingleResolutionEmailFromEvent(com.example.backend.dto.ComplaintResolvedEvent event, com.example.backend.dto.RecipientInfo recipient) {
        String studentEmail = recipient.getEmail();
        String studentName  = recipient.getName();
        String category     = event.getCategory() != null ? event.getCategory() : "General";
        String resolvedOn   = event.getResolvedOn() != null ? event.getResolvedOn() : "N/A";
        String remarksHtml  = (event.getRemarks() != null && !event.getRemarks().isBlank())
                ? event.getRemarks()
                : "Your complaint has been reviewed and resolved by the warden.";

        String htmlBody = buildResolutionHtml(studentName, event.getTitle(), category,
                String.valueOf(event.getComplaintId()), remarksHtml, resolvedOn);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(studentEmail);
            helper.setSubject("✅ Your Complaint Has Been Resolved — HostelHub");
            helper.setText(htmlBody, true); // true = isHtml
            mailSender.send(mimeMessage);
            log.info("[EmailService] Resolution email sent to {} for complaint id={}", studentEmail, event.getComplaintId());
        } catch (Exception e) {
            log.error("[EmailService] Failed to send resolution email to {} for complaint id={}. Error: {}",
                    studentEmail, event.getComplaintId(), e.getMessage());
            throw new RuntimeException("Failed to send email to " + studentEmail, e);
        }
    }

    private void sendSingleResolutionEmail(Complaint complaint, com.example.backend.entity.User student, String remarks) {
        String studentEmail = student.getEmail();
        String studentName  = student.getName();
        String category     = complaint.getCategory() != null ? complaint.getCategory().name() : "General";
        String resolvedOn   = complaint.getCreatedAt() != null
                ? complaint.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                : "N/A";
        String remarksHtml  = (remarks != null && !remarks.isBlank())
                ? remarks
                : "Your complaint has been reviewed and resolved by the warden.";

        String htmlBody = buildResolutionHtml(studentName, complaint.getTitle(), category,
                String.valueOf(complaint.getId()), remarksHtml, resolvedOn);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(studentEmail);
            helper.setSubject("✅ Your Complaint Has Been Resolved — HostelHub");
            helper.setText(htmlBody, true); // true = isHtml
            mailSender.send(mimeMessage);
            log.info("[EmailService] Resolution email sent to {} for complaint id={}", studentEmail, complaint.getId());
        } catch (MessagingException e) {
            log.error("[EmailService] Failed to send resolution email to {} for complaint id={}. Error: {}",
                    studentEmail, complaint.getId(), e.getMessage());
        }
    }

    private String buildResolutionHtml(String studentName, String title, String category,
                                        String complaintId, String remarks, String resolvedOn) {
        return "<!DOCTYPE html>" +
               "<html><head><meta charset='UTF-8'>" +
               "<style>" +
               "  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 0; }" +
               "  .container { max-width: 580px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }" +
               "  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 40px; text-align: center; }" +
               "  .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }" +
               "  .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }" +
               "  .badge { display: inline-block; background: #10b981; color: #fff; border-radius: 999px; padding: 4px 16px; font-size: 13px; font-weight: 600; margin: 16px 0 0; }" +
               "  .body { padding: 32px 40px; }" +
               "  .greeting { font-size: 16px; color: #1e293b; margin-bottom: 16px; }" +
               "  .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }" +
               "  .info-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }" +
               "  .info-table td:first-child { font-weight: 600; color: #64748b; width: 38%; }" +
               "  .info-table td:last-child { color: #1e293b; }" +
               "  .remarks-box { background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }" +
               "  .remarks-box p { margin: 0; font-size: 14px; color: #166534; line-height: 1.6; }" +
               "  .footer { background: #f8fafc; padding: 20px 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }" +
               "</style></head><body>" +
               "<div class='container'>" +
               "  <div class='header'>" +
               "    <h1>🏠 HostelHub</h1>" +
               "    <p>Complaint Management System</p>" +
               "    <div class='badge'>✅ RESOLVED</div>" +
               "  </div>" +
               "  <div class='body'>" +
               "    <p class='greeting'>Dear <strong>" + studentName + "</strong>,</p>" +
               "    <p style='color:#475569;font-size:14px;line-height:1.7;'>Great news! Your complaint has been reviewed and marked as <strong>Resolved</strong> by the warden. Here is a summary of the resolution:</p>" +
               "    <table class='info-table'>" +
               "      <tr><td>Complaint ID</td><td>#" + complaintId + "</td></tr>" +
               "      <tr><td>Category</td><td>" + category + "</td></tr>" +
               "      <tr><td>Issue Title</td><td>" + title + "</td></tr>" +
               "      <tr><td>Status</td><td><span style='color:#10b981;font-weight:700;'>RESOLVED</span></td></tr>" +
               "      <tr><td>Resolved On</td><td>" + resolvedOn + "</td></tr>" +
               "    </table>" +
               "    <div class='remarks-box'>" +
               "      <p><strong>Warden's Remarks:</strong><br/>" + remarks + "</p>" +
               "    </div>" +
               "    <p style='color:#64748b;font-size:13px;'>If you feel the issue is not fully resolved, please submit a new complaint from your student dashboard.</p>" +
               "  </div>" +
               "  <div class='footer'>This is an automated notification from HostelHub. Please do not reply to this email.</div>" +
               "</div></body></html>";
    }
}

