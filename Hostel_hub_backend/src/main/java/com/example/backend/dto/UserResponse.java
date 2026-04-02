package com.example.backend.dto;

import com.example.backend.entity.User;

public class UserResponse {
    private String name;
    private String email;
    private String role;
    private String roomNumber;

    public UserResponse(User user) {
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.roomNumber = user.getRoomNumber();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
}
