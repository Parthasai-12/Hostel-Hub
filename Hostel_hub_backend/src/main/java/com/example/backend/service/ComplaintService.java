package com.example.backend.service;

import com.example.backend.entity.Complaint;
import com.example.backend.entity.ComplaintCategory;
import com.example.backend.entity.User;
import com.example.backend.repository.ComplaintRepository;
import com.example.backend.util.ComplaintCategorizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    public Complaint createComplaint(String title, String description, String imageUrl, User user) {
        Complaint complaint = new Complaint();
        complaint.setTitle(title);
        complaint.setDescription(description);
        complaint.setStatus(Complaint.Status.PENDING);
        complaint.setCategory(ComplaintCategorizer.categorize(description));
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUser(user);
        complaint.setImageUrl(imageUrl);
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getMyComplaints(User user) {
        return complaintRepository.findByUserId(user.getId());
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getComplaintsByCategory(ComplaintCategory category) {
        return complaintRepository.findByCategory(category);
    }

    public Complaint updateComplaintStatus(Long id, Complaint.Status status) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus(status);
        return complaintRepository.save(complaint);
    }
}
