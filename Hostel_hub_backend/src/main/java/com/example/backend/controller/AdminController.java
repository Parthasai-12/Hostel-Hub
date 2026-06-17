package com.example.backend.controller;

import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.User;
import com.example.backend.service.AdminService;
import com.example.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AdminService adminService;

    /**
     * Create a new warden user. Only accessible by users with ADMIN role.
     * Role is always set to WARDEN server-side — never accepted from the request body.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create-warden")
    public ResponseEntity<?> createWarden(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setRole(User.Role.WARDEN); // Always WARDEN — not from request body
            
            User savedUser = authService.register(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Warden created successfully");
            response.put("email", savedUser.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/wardens")
    public ResponseEntity<?> getAllWardens() {
        return ResponseEntity.ok(adminService.getAllWardens());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/wardens/{id}")
    public ResponseEntity<?> removeWarden(@PathVariable Long id) {
        try {
            adminService.removeWarden(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @Autowired
    private com.example.backend.service.EmailMonitoringService emailMonitoringService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/email-monitoring/failed-count")
    public ResponseEntity<?> getFailedEmailCount() {
        Map<String, Object> response = new HashMap<>();
        response.put("failedCount", emailMonitoringService.getFailedEmailCount());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/email-monitoring/dlq-entries")
    public ResponseEntity<?> getDlqEntries(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(emailMonitoringService.getDeadLetterQueueEntries(limit));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/email-monitoring/dlq-messages")
    public ResponseEntity<?> getDlqMessages(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(emailMonitoringService.getFailedEmails(limit));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/email-monitoring/dlq-messages/{messageId}")
    public ResponseEntity<?> getDlqMessageDetails(@PathVariable String messageId) {
        com.example.backend.dto.FailedEmailInfo details = emailMonitoringService.getFailedEmailDetails(messageId);
        if (details != null) {
            return ResponseEntity.ok(details);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/email-monitoring/dlq-messages/{messageId}/resend")
    public ResponseEntity<?> resendFailedMessage(@PathVariable String messageId) {
        boolean success = emailMonitoringService.resendFailedEmail(messageId);
        Map<String, Object> response = new HashMap<>();
        if (success) {
            response.put("message", "Message resend successfully initiated");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Failed to find or resend message");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
