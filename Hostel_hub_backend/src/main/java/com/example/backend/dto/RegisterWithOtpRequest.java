package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class RegisterWithOtpRequest extends RegisterRequest {

    @NotBlank(message = "OTP is required")
    private String otp;
    
    public String getOtp() {
        return otp;
    }
    
    public void setOtp(String otp) {
        this.otp = otp;
    }
}
