package com.example.backend.service;

import com.example.backend.entity.Complaint;
import com.example.backend.entity.ComplaintCategory;
import com.example.backend.entity.User;
import com.example.backend.repository.ComplaintRepository;
import com.example.backend.util.ComplaintCategorizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintService.class);

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EmailService emailService;

    // -------------------------------------------------------------------------
    // Student: create complaint
    // -------------------------------------------------------------------------
    public Complaint createComplaint(String title, String description, String imageUrl, User user) {
        Complaint complaint = new Complaint();
        complaint.setTitle(title);
        complaint.setDescription(description);
        complaint.setStatus(Complaint.Status.PENDING);
        complaint.setCategory(ComplaintCategorizer.categorize(description));
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUser(user);
        complaint.setImageUrl(imageUrl);
        log.info("[ComplaintService] Created complaint '{}' for user id={}", title, user.getId());
        return complaintRepository.save(complaint);
    }

    // -------------------------------------------------------------------------
    // Student: my complaints
    // -------------------------------------------------------------------------
    public List<Complaint> getMyComplaints(User user) {
        return complaintRepository.findByUserId(user.getId());
    }

    // -------------------------------------------------------------------------
    // Warden: all complaints
    // -------------------------------------------------------------------------
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // -------------------------------------------------------------------------
    // Warden: by category
    // -------------------------------------------------------------------------
    public List<Complaint> getComplaintsByCategory(ComplaintCategory category) {
        return complaintRepository.findByCategory(category);
    }

    // -------------------------------------------------------------------------
    // Warden: update status + async email on RESOLVED (Feature 3)
    // -------------------------------------------------------------------------
    public Complaint updateComplaintStatus(Long id, Complaint.Status newStatus, String remarks) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        Complaint.Status previousStatus = complaint.getStatus();
        complaint.setStatus(newStatus);
        Complaint saved = complaintRepository.save(complaint);

        log.info("[ComplaintService] Complaint id={} status changed: {} -> {}", id, previousStatus, newStatus);

        // Trigger resolution email ONLY when transitioning TO RESOLVED (prevents duplicate emails)
        if (newStatus == Complaint.Status.RESOLVED && previousStatus != Complaint.Status.RESOLVED) {
            log.info("[ComplaintService] Triggering async resolution email for complaint id={}", id);
            emailService.sendResolutionEmail(saved, remarks);
        }

        return saved;
    }

    // -------------------------------------------------------------------------
    // Admin: all complaints with optional status + category filters (Feature 1)
    // -------------------------------------------------------------------------
    public List<Complaint> getFilteredComplaints(Complaint.Status status, ComplaintCategory category) {
        if (status != null && category != null) {
            log.debug("[ComplaintService] Admin filter: status={}, category={}", status, category);
            return complaintRepository.findByCategoryAndStatus(category, status);
        } else if (status != null) {
            log.debug("[ComplaintService] Admin filter: status={}", status);
            return complaintRepository.findByStatus(status);
        } else if (category != null) {
            log.debug("[ComplaintService] Admin filter: category={}", category);
            return complaintRepository.findByCategory(category);
        }
        return complaintRepository.findAll();
    }

    // -------------------------------------------------------------------------
    // Admin: delete complaint (Feature 1)
    // -------------------------------------------------------------------------
    public void deleteComplaint(Long id) {
        if (!complaintRepository.existsById(id)) {
            log.warn("[ComplaintService] Delete failed — complaint id={} not found", id);
            throw new RuntimeException("Complaint not found with id: " + id);
        }
        complaintRepository.deleteById(id);
        log.info("[ComplaintService] Complaint id={} deleted by admin", id);
    }
}

