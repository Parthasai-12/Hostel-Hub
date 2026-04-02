package com.example.backend.controller;

import com.example.backend.dto.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();
        User user = null;

        if (principal instanceof User) {
            user = (User) principal;
        } else if (principal instanceof String) {
            // Fallback if principal is just the username/email (e.g. anonymous or different setup)
            user = userRepository.findByEmail((String) principal);
        }

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new UserResponse(user));
    }
}
