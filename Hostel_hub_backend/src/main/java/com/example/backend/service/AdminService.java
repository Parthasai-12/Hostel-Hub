package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private UserRepository userRepository;

    /**
     * Returns all users with WARDEN role.
     */
    public List<User> getAllWardens() {
        log.info("[AdminService] Fetching all wardens");
        return userRepository.findByRole(User.Role.WARDEN);
    }

    /**
     * Removes a warden by ID.
     * Validates the user exists and is actually a WARDEN before deletion.
     */
    public void removeWarden(Long id) {
        log.info("[AdminService] Attempting to remove warden with id={}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("[AdminService] Warden not found with id={}", id);
                    return new IllegalArgumentException("Warden not found with id: " + id);
                });

        if (user.getRole() != User.Role.WARDEN) {
            log.warn("[AdminService] User id={} is not a warden (role={})", id, user.getRole());
            throw new IllegalArgumentException("User with id " + id + " is not a warden");
        }

        userRepository.delete(user);
        log.info("[AdminService] Warden id={} ({}) removed successfully", id, user.getEmail());
    }
}
