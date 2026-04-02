package com.example.backend.controller;

import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.RegisterWithOtpRequest;
import com.example.backend.dto.ResetPasswordRequest;
import com.example.backend.entity.User;
import com.example.backend.service.AuthService;
import com.example.backend.service.OtpService;
import com.example.backend.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        String otp = otpService.generateOtp(email);
        emailService.sendVerificationOtp(email, otp);

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        if (email == null || otp == null) {
            throw new IllegalArgumentException("Email and OTP are required");
        }

        boolean verified = otpService.verifyOtp(email, otp);
        if (!verified) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP verified successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp-and-register")
    public ResponseEntity<User> verifyOtpAndRegister(@Valid @RequestBody RegisterWithOtpRequest request) {
        boolean verified = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!verified) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRoomNumber(request.getRoomNumber());

        // This will succeed because verifyOtp marked the email as verified internally
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(User.Role.STUDENT); // Default role
        user.setRoomNumber(request.getRoomNumber());
        User savedUser = authService.register(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        String token = authService.login(email, password);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }

    /**
     * Create a new admin user. Only accessible by users with ADMIN role.
     * Role is always set to ADMIN server-side — never accepted from the request
     * body.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/create")
    public ResponseEntity<Map<String, String>> createAdmin(@Valid @RequestBody RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(User.Role.ADMIN); // Always ADMIN — not from request body
        User savedUser = authService.register(user);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin created successfully");
        response.put("email", savedUser.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Create a new warden user. Only accessible by users with ADMIN role.
     * Role is always set to WARDEN server-side — never accepted from the request
     * body.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/create-warden")
    public ResponseEntity<Map<String, String>> createWarden(@Valid @RequestBody RegisterRequest request) {
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
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<Map<String, String>> forgotPasswordSendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        authService.validateUserExists(email);
        
        String otp = otpService.generateOtp(email);
        emailService.sendVerificationOtp(email, otp);

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<Map<String, String>> forgotPasswordVerifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        if (email == null || otp == null) {
            throw new IllegalArgumentException("Email and OTP are required");
        }
        
        boolean verified = otpService.verifyOtp(email, otp);
        if (!verified) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP verified successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getNewPassword());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }
}
