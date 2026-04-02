package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public void run(String... args) {
        System.out.println("\n---------------------------------------------------------");
        System.out.println("[Startup Validation] Connected to Database:");
        System.out.println(dbUrl);
        System.out.println("---------------------------------------------------------\n");

        String adminEmail = "parthasai93@gmail.com";
        User existingAdmin = userRepository.findByEmail(adminEmail);

        if (existingAdmin == null) {
            System.out.println("[DataInitializer] Default admin not found. Creating...");
            User admin = new User();
            admin.setName("sai_admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Parthasai@12"));
            admin.setRole(User.Role.ADMIN);
            
            userRepository.save(admin);
            System.out.println("[DataInitializer] Default admin created successfully.");
        } else {
            System.out.println("[DataInitializer] Default admin already exists. Unmodified.");
        }
    }
}
