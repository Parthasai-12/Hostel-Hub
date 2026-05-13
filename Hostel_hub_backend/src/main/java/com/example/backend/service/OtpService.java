package com.example.backend.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // Store generated OTPs: Email -> OTP Data
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    
    // Track verified emails: Email -> boolean
    private final Map<String, Boolean> verifiedEmails = new ConcurrentHashMap<>();

    private static class OtpData {
        String otp;
        LocalDateTime expiry;

        OtpData(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }

    public String generateOtp(String email) {
        Random random = new Random();
        String otp = String.format("%06d", random.nextInt(1000000));
        
        // OTP valid for 5 minutes
        otpStorage.put(email, new OtpData(otp, LocalDateTime.now().plusMinutes(5)));
        
        // Mark as unverified when new OTP generated
        verifiedEmails.put(email, false);
        return otp;
    }

    public boolean verifyOtp(String email, String inputOtp) {
        OtpData otpData = otpStorage.get(email);
        
        if (otpData == null) {
            return false;
        }
        
        if (LocalDateTime.now().isAfter(otpData.expiry)) {
            otpStorage.remove(email);
            return false; // Expired
        }
        
        if (otpData.otp.equals(inputOtp)) {
            verifiedEmails.put(email, true);
            otpStorage.remove(email); // Clean up after successful verification
            return true;
        }
        
        return false;
    }

    public boolean isVerified(String email) {
        return verifiedEmails.getOrDefault(email, false);
    }
    
    public void clearVerification(String email) {
        verifiedEmails.remove(email);
    }
}
