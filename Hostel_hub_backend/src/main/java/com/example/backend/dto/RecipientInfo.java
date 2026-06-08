package com.example.backend.dto;

import java.io.Serializable;

public class RecipientInfo implements Serializable {
    private static final long serialVersionUID = 1L;

    private String email;
    private String name;

    public RecipientInfo() {}

    public RecipientInfo(String email, String name) {
        this.email = email;
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "RecipientInfo{" +
                "email='" + email + '\'' +
                ", name='" + name + '\'' +
                '}';
    }
}
