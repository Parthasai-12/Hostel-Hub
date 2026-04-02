package com.example.backend.dto;

import com.example.backend.entity.Complaint;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private Complaint.Status status;

    // Getters and setters
    public Complaint.Status getStatus() {
        return status;
    }

    public void setStatus(Complaint.Status status) {
        this.status = status;
    }
}
