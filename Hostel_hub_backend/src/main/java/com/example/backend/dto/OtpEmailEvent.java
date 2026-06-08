package com.example.backend.dto;

import java.io.Serializable;

public class OtpEmailEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String email;
    private String otp;

    public OtpEmailEvent() {}

    public OtpEmailEvent(String email, String otp) {
        this.email = email;
        this.otp = otp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    @Override
    public String toString() {
        return "OtpEmailEvent{" +
                "email='" + email + '\'' +
                ", otp='" + otp + '\'' +
                '}';
    }
}
