package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintCategory category;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(length = 500)
    private String imageUrl;

    @Column(name = "duplicate_count", nullable = false)
    private Integer duplicateCount = 1;

    @Lob
    @Column(name = "embedding", columnDefinition = "TEXT")
    @JsonIgnore
    private String embedding;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "complaint_affected_students",
        joinColumns = @JoinColumn(name = "complaint_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private java.util.List<User> affectedStudents = new java.util.ArrayList<>();

    @Column(name = "estimated_resolution_days")
    private Integer estimatedResolutionDays;

    @Column(name = "expected_completion_date")
    private java.time.LocalDate expectedCompletionDate;

    @Column(name = "progress_message", length = 1000)
    private String progressMessage;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors, getters, setters

    public Complaint() {}

    public Complaint(String title, String description, Status status, ComplaintCategory category, LocalDateTime createdAt, User user) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.category = category;
        this.createdAt = createdAt;
        this.user = user;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public ComplaintCategory getCategory() { return category; }
    public void setCategory(ComplaintCategory category) { this.category = category; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getDuplicateCount() { return duplicateCount; }
    public void setDuplicateCount(Integer duplicateCount) { this.duplicateCount = duplicateCount; }

    public String getEmbedding() { return embedding; }
    public void setEmbedding(String embedding) { this.embedding = embedding; }

    public java.util.List<User> getAffectedStudents() { return affectedStudents; }
    public void setAffectedStudents(java.util.List<User> affectedStudents) { this.affectedStudents = affectedStudents; }

    public Integer getEstimatedResolutionDays() { return estimatedResolutionDays; }
    public void setEstimatedResolutionDays(Integer estimatedResolutionDays) { this.estimatedResolutionDays = estimatedResolutionDays; }

    public java.time.LocalDate getExpectedCompletionDate() { return expectedCompletionDate; }
    public void setExpectedCompletionDate(java.time.LocalDate expectedCompletionDate) { this.expectedCompletionDate = expectedCompletionDate; }

    public String getProgressMessage() { return progressMessage; }
    public void setProgressMessage(String progressMessage) { this.progressMessage = progressMessage; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @JsonProperty("studentName")
    public String getStudentName() {
        return user != null ? user.getName() : "Unknown";
    }

    @JsonProperty("roomNumber")
    public String getRoomNumber() {
        return user != null ? user.getRoomNumber() : null;
    }

    public enum Status {
        PENDING, IN_PROGRESS, RESOLVED
    }
}
