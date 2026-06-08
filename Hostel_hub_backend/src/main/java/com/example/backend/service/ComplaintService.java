package com.example.backend.service;

import com.example.backend.entity.Complaint;
import com.example.backend.entity.ComplaintCategory;
import com.example.backend.entity.User;
import com.example.backend.repository.ComplaintRepository;
import com.example.backend.util.ComplaintCategorizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.backend.service.EmailProducer;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;

@Service
public class ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintService.class);

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailProducer emailProducer;

    @Autowired
    private EmbeddingService embeddingService;

    @Value("${complaint.similarity.threshold:0.75}")
    private double similarityThreshold;

    @Value("${complaint.recent.days:7}")
    private int recentDays;

    // -------------------------------------------------------------------------
    // Student: create complaint
    // -------------------------------------------------------------------------
    public Complaint createComplaint(String title, String description, String imageUrl, User user) {
        log.info("[ComplaintService] Processing new complaint: '{}' from user id={} (room={})", 
            title, user.getId(), user.getRoomNumber());

        // Deterministic category mapping based on the frontend selected category (passed in the title parameter)
        ComplaintCategory newCategory = null;
        if (title != null) {
            switch (title.trim()) {
                case "Electrical Issue":
                    newCategory = ComplaintCategory.ELECTRICITY;
                    break;
                case "Plumbing Issue":
                    newCategory = ComplaintCategory.WATER;
                    break;
                case "Furniture Damage":
                    newCategory = ComplaintCategory.MAINTENANCE;
                    break;
                case "WiFi/Internet":
                    newCategory = ComplaintCategory.INTERNET;
                    break;
                case "Cleanliness":
                    newCategory = ComplaintCategory.CLEANLINESS;
                    break;
                case "Food":
                    newCategory = ComplaintCategory.FOOD;
                    break;
                case "Security":
                case "Other":
                    newCategory = ComplaintCategory.OTHER;
                    break;
                default:
                    try {
                        newCategory = ComplaintCategory.valueOf(title.trim().toUpperCase());
                    } catch (IllegalArgumentException e) {
                        // fallback to description-based categorization
                    }
                    break;
            }
        }
        if (newCategory == null) {
            newCategory = ComplaintCategorizer.categorize(description);
        }
        log.info("[ComplaintService] Mapped/Computed category for incoming complaint: {}", newCategory);

        // Normalize text before generating the embedding
        String normalizedDescription = com.example.backend.util.EmbeddingUtil.normalizeText(description);
        log.info("[ComplaintService] Normalized text for embedding: '{}'", normalizedDescription);

        // 1. Generate semantic embedding
        float[] newEmbedding = embeddingService.getEmbedding(normalizedDescription);

        if (newEmbedding != null) {
            // 2. Fetch unresolved recent complaints
            LocalDateTime dateThreshold = LocalDateTime.now().minusDays(recentDays);
            List<Complaint> unresolvedRecent = complaintRepository.findUnresolvedRecentComplaints(dateThreshold);
            log.info("[ComplaintService] Found {} unresolved recent complaints to scan (dateThreshold = {}).", 
                unresolvedRecent.size(), dateThreshold);

            // 3. Filter by room or block based on category
            String studentBlock = com.example.backend.util.EmbeddingUtil.extractBlock(user.getRoomNumber());
            List<Complaint> sameBlockAndCategoryComplaints = new java.util.ArrayList<>();
            
            for (Complaint existing : unresolvedRecent) {
                // Check category matching
                if (existing.getCategory() != newCategory) {
                    log.debug("[ComplaintService] Skipping complaint #{} (title='{}') - category mismatch (incoming: {}, existing: {})",
                        existing.getId(), existing.getTitle(), newCategory, existing.getCategory());
                    continue;
                }

                // Determine grouping level: room-level vs block-level
                boolean roomLevelMatchNeeded = (newCategory == ComplaintCategory.ELECTRICITY ||
                                               newCategory == ComplaintCategory.WATER ||
                                               newCategory == ComplaintCategory.MAINTENANCE);

                if (roomLevelMatchNeeded) {
                    // Must be exact same room
                    String incomingRoom = user.getRoomNumber() != null ? user.getRoomNumber().trim() : "";
                    String existingRoom = existing.getRoomNumber() != null ? existing.getRoomNumber().trim() : "";
                    if (incomingRoom.isEmpty() || !incomingRoom.equalsIgnoreCase(existingRoom)) {
                        log.info("[ComplaintService] Skipping complaint #{} (title='{}') - room mismatch for room-level category {} (incoming: {}, existing: {})",
                            existing.getId(), existing.getTitle(), newCategory, incomingRoom, existingRoom);
                        continue;
                    }
                } else {
                    // Check block matching (for wider floor-level or block-level issues)
                    String existingBlock = com.example.backend.util.EmbeddingUtil.extractBlock(existing.getRoomNumber());
                    if (studentBlock.isEmpty() || !studentBlock.equalsIgnoreCase(existingBlock)) {
                        log.debug("[ComplaintService] Skipping complaint #{} (title='{}') - block mismatch (incoming: {}, existing: {})",
                            existing.getId(), existing.getTitle(), studentBlock, existingBlock);
                        continue;
                    }
                }

                sameBlockAndCategoryComplaints.add(existing);
            }

            log.info("[ComplaintService] Found {} candidate complaints in the same block '{}' and category '{}' for similarity check.", 
                sameBlockAndCategoryComplaints.size(), studentBlock, newCategory);

            // 4. Compute similarity and find duplicate
            Complaint highestMatch = null;
            double maxSimilarity = -1.0;

            for (Complaint existing : sameBlockAndCategoryComplaints) {
                if (existing.getEmbedding() != null) {
                    float[] existingEmbedding = com.example.backend.util.EmbeddingUtil.deserializeEmbedding(existing.getEmbedding());
                    if (existingEmbedding != null) {
                        double similarity = com.example.backend.util.EmbeddingUtil.cosineSimilarity(newEmbedding, existingEmbedding);
                        log.info("[ComplaintService] Comparing with existing complaint #{} (title='{}'). Cosine Similarity = {} [Threshold = {}]", 
                            existing.getId(), existing.getTitle(), similarity, similarityThreshold);
                        if (similarity > maxSimilarity) {
                            maxSimilarity = similarity;
                            highestMatch = existing;
                        }
                    }
                }
            }

            // 5. If similarity exceeds threshold, group/link student to the existing master complaint
            if (highestMatch != null && maxSimilarity >= similarityThreshold) {
                log.info("[ComplaintService] SUCCESS: Semantic duplicate detected! " +
                         "Matched complaint ID: #{}, Similarity Score: {} >= Threshold: {}. Grouping complaint...",
                    highestMatch.getId(), maxSimilarity, similarityThreshold);
                
                boolean alreadyLinked = false;
                if (highestMatch.getUser().getId().equals(user.getId())) {
                    alreadyLinked = true;
                } else {
                    for (User linkedUser : highestMatch.getAffectedStudents()) {
                        if (linkedUser.getId().equals(user.getId())) {
                            alreadyLinked = true;
                            break;
                        }
                    }
                }

                if (!alreadyLinked) {
                    highestMatch.getAffectedStudents().add(user);
                    highestMatch.setDuplicateCount(highestMatch.getDuplicateCount() + 1);
                    Complaint saved = complaintRepository.save(highestMatch);
                    log.info("[ComplaintService] Linked user id={} to complaint #{}. New affected count: {}", 
                        user.getId(), saved.getId(), saved.getDuplicateCount());
                    return saved;
                } else {
                    log.info("[ComplaintService] User id={} already linked to complaint #{}. Returning existing.", 
                        user.getId(), highestMatch.getId());
                    return highestMatch;
                }
            } else {
                if (highestMatch != null) {
                    log.info("[ComplaintService] NO MATCH: Highest similarity was {} (complaint #{}), which is below threshold {}.",
                        maxSimilarity, highestMatch.getId(), similarityThreshold);
                } else {
                    log.info("[ComplaintService] NO MATCH: No candidate complaints found in the same category ({}) and block ({}) to compare.",
                        newCategory, studentBlock);
                }
            }
        } else {
            log.warn("[ComplaintService] Embedding service returned null. Skipping semantic duplicate detection.");
        }

        // 6. Otherwise (no match, or service error), create as a new master complaint normally
        Complaint complaint = new Complaint();
        complaint.setTitle(title);
        complaint.setDescription(description);
        complaint.setStatus(Complaint.Status.PENDING);
        complaint.setCategory(newCategory);
        complaint.setCreatedAt(LocalDateTime.now());
        complaint.setUser(user);
        complaint.setImageUrl(imageUrl);
        complaint.setDuplicateCount(1);
        if (newEmbedding != null) {
            complaint.setEmbedding(com.example.backend.util.EmbeddingUtil.serializeEmbedding(newEmbedding));
        }

        log.info("[ComplaintService] Creating new master complaint '{}' for user id={} as no duplicate matched.", title, user.getId());
        return complaintRepository.save(complaint);
    }

    // -------------------------------------------------------------------------
    // Student: my complaints
    // -------------------------------------------------------------------------
    public List<Complaint> getMyComplaints(User user) {
        return complaintRepository.findByUserIdOrAffectedStudentsId(user.getId());
    }

    // -------------------------------------------------------------------------
    // Warden: all complaints
    // -------------------------------------------------------------------------
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // -------------------------------------------------------------------------
    // Warden: by category
    // -------------------------------------------------------------------------
    public List<Complaint> getComplaintsByCategory(ComplaintCategory category) {
        return complaintRepository.findByCategory(category);
    }

    // -------------------------------------------------------------------------
    // Warden: update status + async email on RESOLVED (Feature 3)
    // -------------------------------------------------------------------------
    public Complaint updateComplaintStatus(Long id, Complaint.Status newStatus, String remarks) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        Complaint.Status previousStatus = complaint.getStatus();
        complaint.setStatus(newStatus);
        Complaint saved = complaintRepository.save(complaint);

        log.info("[ComplaintService] Complaint id={} status changed: {} -> {}", id, previousStatus, newStatus);

        // Trigger resolution email ONLY when transitioning TO RESOLVED (prevents duplicate emails)
        if (newStatus == Complaint.Status.RESOLVED && previousStatus != Complaint.Status.RESOLVED) {
            log.info("[ComplaintService] Triggering async resolution email for complaint id={}", id);
            
            java.util.List<com.example.backend.dto.RecipientInfo> recipients = new java.util.ArrayList<>();
            if (saved.getUser() != null) {
                recipients.add(new com.example.backend.dto.RecipientInfo(saved.getUser().getEmail(), saved.getUser().getName()));
            }
            if (saved.getAffectedStudents() != null) {
                for (User student : saved.getAffectedStudents()) {
                    recipients.add(new com.example.backend.dto.RecipientInfo(student.getEmail(), student.getName()));
                }
            }
            
            String resolvedOn = saved.getCreatedAt() != null
                    ? saved.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                    : "N/A";
            
            com.example.backend.dto.ComplaintResolvedEvent event = new com.example.backend.dto.ComplaintResolvedEvent(
                saved.getId(),
                saved.getTitle(),
                saved.getCategory() != null ? saved.getCategory().name() : "General",
                resolvedOn,
                remarks,
                recipients
            );
            
            emailProducer.publishComplaintResolvedEvent(event);
        }

        return saved;
    }

    // -------------------------------------------------------------------------
    // Admin: all complaints with optional status + category filters (Feature 1)
    // -------------------------------------------------------------------------
    public List<Complaint> getFilteredComplaints(Complaint.Status status, ComplaintCategory category) {
        if (status != null && category != null) {
            log.debug("[ComplaintService] Admin filter: status={}, category={}", status, category);
            return complaintRepository.findByCategoryAndStatus(category, status);
        } else if (status != null) {
            log.debug("[ComplaintService] Admin filter: status={}", status);
            return complaintRepository.findByStatus(status);
        } else if (category != null) {
            log.debug("[ComplaintService] Admin filter: category={}", category);
            return complaintRepository.findByCategory(category);
        }
        return complaintRepository.findAll();
    }

    // -------------------------------------------------------------------------
    // Admin: delete complaint (Feature 1)
    // -------------------------------------------------------------------------
    public void deleteComplaint(Long id) {
        if (!complaintRepository.existsById(id)) {
            log.warn("[ComplaintService] Delete failed — complaint id={} not found", id);
            throw new RuntimeException("Complaint not found with id: " + id);
        }
        complaintRepository.deleteById(id);
        log.info("[ComplaintService] Complaint id={} deleted by admin", id);
    }
}

