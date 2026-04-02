package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User register(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Enforce OTP verification before registration if the user has role STUDENT
        if (user.getRole() == null || user.getRole() == User.Role.STUDENT) {
             if (!otpService.isVerified(user.getEmail())) {
                 throw new IllegalArgumentException("Email is not verified via OTP");
             }
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) {
            if (user.getEmail().contains("admin")) {
                user.setRole(User.Role.ADMIN);
            } else {
                user.setRole(User.Role.STUDENT);
            }
        }
        User savedUser = userRepository.save(user);
        otpService.clearVerification(user.getEmail()); // Clear OTP verified state
        return savedUser;
    }

    public String login(String email, String password) {
        System.out.println("[AuthService] Login attempt — email='" + email + "'");
        User user = userRepository.findByEmail(email);
        if (user == null) {
            System.out.println("[AuthService] FAIL — no user found for email='" + email + "'");
            throw new IllegalArgumentException("Invalid credentials");
        }
        System.out.println("[AuthService] User found — id=" + user.getId() + " role=" + user.getRole());
        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
        System.out.println("[AuthService] Password matches: " + passwordMatches);
        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        if (user.getRole() == null) {
            user.setRole(User.Role.STUDENT);
            userRepository.save(user);
        }
        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User with this email does not exist");
        }
        if (!otpService.isVerified(email)) {
            throw new IllegalArgumentException("Email is not verified via OTP");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpService.clearVerification(email);
    }

    public void validateUserExists(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("No account found with this email address");
        }
    }
}
