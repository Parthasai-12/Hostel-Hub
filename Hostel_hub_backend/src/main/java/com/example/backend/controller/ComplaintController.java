package com.example.backend.controller;

import com.example.backend.dto.ComplaintRequest;
import com.example.backend.dto.StatusUpdateRequest;
import com.example.backend.entity.Complaint;
import com.example.backend.entity.ComplaintCategory;
import com.example.backend.entity.User;
import com.example.backend.service.ComplaintService;
import com.example.backend.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Complaint> createComplaint(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal User user) {
        
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String fileName = fileStorageService.storeFile(image);
            imageUrl = fileStorageService.getFileUrl(fileName);
        }
        
        Complaint complaint = complaintService.createComplaint(title, description, imageUrl, user);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Complaint>> getMyComplaints(@AuthenticationPrincipal User user) {
        List<Complaint> complaints = complaintService.getMyComplaints(user);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('WARDEN')")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        List<Complaint> complaints = complaintService.getAllComplaints();
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('WARDEN')")
    public ResponseEntity<List<Complaint>> getComplaintsByCategory(@PathVariable ComplaintCategory category) {
        List<Complaint> complaints = complaintService.getComplaintsByCategory(category);
        return ResponseEntity.ok(complaints);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('WARDEN')")
    public ResponseEntity<Complaint> updateComplaintStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        Complaint complaint = complaintService.updateComplaintStatus(id, request.getStatus());
        return ResponseEntity.ok(complaint);
    }
}
