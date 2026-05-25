package com.example.backend.config;

import com.example.backend.entity.Complaint;
import com.example.backend.entity.User;
import com.example.backend.repository.ComplaintRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.EmbeddingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EmbeddingService embeddingService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        System.out.println("\n---------------------------------------------------------");
        System.out.println("[Startup Validation] Connected to Database:");
        System.out.println(dbUrl);
        System.out.println("---------------------------------------------------------\n");

        // 1. Initialize Default Admin
        try {
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
        } catch (Exception e) {
            System.err.println("[DataInitializer] Error initializing admin: " + e.getMessage());
        }

        // 2. Initialize Embeddings and Deduplicate existing complaints
        try {
            // Populate missing embeddings & sanitize duplicateCount
            java.util.List<Complaint> allComplaints = complaintRepository.findAll();
            boolean countUpdated = false;
            for (Complaint c : allComplaints) {
                if (c.getDuplicateCount() == null || c.getDuplicateCount() <= 0) {
                    c.setDuplicateCount(1);
                    complaintRepository.save(c);
                    countUpdated = true;
                }
            }
            if (countUpdated) {
                System.out.println("[DataInitializer] Sanitized duplicateCount values in database.");
                // Refresh list
                allComplaints = complaintRepository.findAll();
            }

            long missingCount = allComplaints.stream().filter(c -> c.getEmbedding() == null).count();
            if (missingCount > 0) {
                System.out.println("[DataInitializer] Found " + missingCount + " existing complaints with missing embeddings. Generating...");
                for (Complaint complaint : allComplaints) {
                    if (complaint.getEmbedding() == null) {
                        String normalized = com.example.backend.util.EmbeddingUtil.normalizeText(complaint.getDescription());
                        float[] embedding = embeddingService.getEmbedding(normalized);
                        if (embedding != null) {
                            complaint.setEmbedding(com.example.backend.util.EmbeddingUtil.serializeEmbedding(embedding));
                            complaintRepository.save(complaint);
                            System.out.println("[DataInitializer] Generated embedding for complaint #" + complaint.getId());
                        }
                    }
                }
                System.out.println("[DataInitializer] Completed embedding initialization for existing complaints.");
            }

            // Perform retroactive deduplication for UNRESOLVED complaints
            // Refresh list from database to ensure embeddings are loaded
            java.util.List<Complaint> unresolved = complaintRepository.findAll().stream()
                .filter(c -> c.getStatus() != Complaint.Status.RESOLVED)
                .collect(java.util.stream.Collectors.toList());

            double threshold = 0.70;
            System.out.println("[DataInitializer] Scanning " + unresolved.size() + " unresolved complaints for retroactive semantic duplicates...");

            boolean changed = false;
            for (int i = 0; i < unresolved.size(); i++) {
                Complaint master = unresolved.get(i);
                if (master.getId() == null) continue; // Already merged

                String masterBlock = com.example.backend.util.EmbeddingUtil.extractBlock(master.getRoomNumber());
                float[] masterEmbedding = com.example.backend.util.EmbeddingUtil.deserializeEmbedding(master.getEmbedding());
                if (masterEmbedding == null) continue;

                for (int j = i + 1; j < unresolved.size(); j++) {
                    Complaint duplicate = unresolved.get(j);
                    if (duplicate.getId() == null) continue; // Already merged

                    // Same category check
                    if (master.getCategory() != duplicate.getCategory()) continue;

                    // Determine matching strategy based on category
                    com.example.backend.entity.ComplaintCategory cat = master.getCategory();
                    boolean roomLevelMatchNeeded = (cat == com.example.backend.entity.ComplaintCategory.ELECTRICITY ||
                                                   cat == com.example.backend.entity.ComplaintCategory.WATER ||
                                                   cat == com.example.backend.entity.ComplaintCategory.MAINTENANCE);

                    if (roomLevelMatchNeeded) {
                        String masterRoom = master.getRoomNumber() != null ? master.getRoomNumber().trim() : "";
                        String duplicateRoom = duplicate.getRoomNumber() != null ? duplicate.getRoomNumber().trim() : "";
                        if (masterRoom.isEmpty() || !masterRoom.equalsIgnoreCase(duplicateRoom)) continue;
                    } else {
                        // Same block check
                        String duplicateBlock = com.example.backend.util.EmbeddingUtil.extractBlock(duplicate.getRoomNumber());
                        if (masterBlock.isEmpty() || !masterBlock.equalsIgnoreCase(duplicateBlock)) continue;
                    }

                    // Cosine similarity check
                    float[] duplicateEmbedding = com.example.backend.util.EmbeddingUtil.deserializeEmbedding(duplicate.getEmbedding());
                    if (duplicateEmbedding == null) continue;

                    double similarity = com.example.backend.util.EmbeddingUtil.cosineSimilarity(masterEmbedding, duplicateEmbedding);
                    if (similarity >= threshold) {
                        System.out.println("[DataInitializer] Found pre-existing semantic duplicate! Merging complaint #" + duplicate.getId() + 
                            " ('" + duplicate.getDescription() + "') into #" + master.getId() + " ('" + master.getDescription() + "') with similarity: " + similarity);

                        // Merge duplicate user and affected students into master
                        java.util.List<User> affected = master.getAffectedStudents();
                        
                        // Add duplicate's reporter
                        boolean reporterLinked = false;
                        if (master.getUser().getId().equals(duplicate.getUser().getId())) {
                            reporterLinked = true;
                        } else {
                            for (User u : affected) {
                                if (u.getId().equals(duplicate.getUser().getId())) {
                                    reporterLinked = true;
                                    break;
                                }
                            }
                        }
                        if (!reporterLinked) {
                            affected.add(duplicate.getUser());
                        }

                        // Add duplicate's affected students
                        if (duplicate.getAffectedStudents() != null) {
                            for (User du : duplicate.getAffectedStudents()) {
                                boolean linked = false;
                                if (master.getUser().getId().equals(du.getId())) {
                                    linked = true;
                                } else {
                                    for (User u : affected) {
                                        if (u.getId().equals(du.getId())) {
                                            linked = true;
                                            break;
                                        }
                                    }
                                }
                                if (!linked) {
                                    affected.add(du);
                                }
                            }
                        }

                        // Update counts
                        master.setDuplicateCount(master.getDuplicateCount() + duplicate.getDuplicateCount());
                        complaintRepository.save(master);

                        // Delete duplicate from DB
                        complaintRepository.delete(duplicate);
                        
                        // Mark as merged in local list
                        duplicate.setId(null);
                        changed = true;
                    }
                }
            }
            if (changed) {
                System.out.println("[DataInitializer] Retroactive deduplication complete. Database is now fully clean!");
            } else {
                System.out.println("[DataInitializer] No pre-existing duplicates found. Database is already clean.");
            }
        } catch (Exception e) {
            System.err.println("[DataInitializer] Warn: Failed retroactive deduplication: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
