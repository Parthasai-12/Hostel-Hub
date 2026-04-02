package com.example.backend.controller;

import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.User;
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
}
