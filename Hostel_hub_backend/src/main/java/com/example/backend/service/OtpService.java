package com.example.backend.service;

import com.example.backend.entity.OtpToken;
import com.example.backend.repository.OtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    @Autowired
    private OtpRepository otpRepository;

    @Transactional
    public String generateOtp(String email) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        Random random = new Random();
        String otp = String.format("%06d", random.nextInt(1000000));
        
        log.info("[OtpService] Generating new OTP for email: {}", normalizedEmail);
        log.info("[OtpService] Generated OTP (DEBUG): '{}'", otp);
        
        // OTP valid for 5 minutes (in milliseconds)
        Long expiryTime = System.currentTimeMillis() + (5 * 60 * 1000);
        
        // Check if an OTP already exists for this email
        Optional<OtpToken> existingOtpOpt = otpRepository.findByEmail(normalizedEmail);
        OtpToken otpToken;
        if (existingOtpOpt.isPresent()) {
            otpToken = existingOtpOpt.get();
            otpToken.setOtp(otp);
            otpToken.setExpiryTime(expiryTime);
            otpToken.setVerified(false);
            log.info("[OtpService] Updated existing OTP record in DB for {}", normalizedEmail);
        } else {
            otpToken = new OtpToken(normalizedEmail, otp, expiryTime);
            log.info("[OtpService] Created new OTP record in DB for {}", normalizedEmail);
        }
        
        otpRepository.save(otpToken);
        log.info("[OtpService] OTP properly stored in database. Expiry: {}", expiryTime);
        
        return otp;
    }

    @Transactional
    public boolean verifyOtp(String email, String inputOtp) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        String trimmedOtp = inputOtp != null ? inputOtp.trim() : "";
        
        log.info("[OtpService] Attempting to verify OTP for email: {}", normalizedEmail);
        log.debug("[OtpService] Input OTP for verification: '{}'", trimmedOtp);
        
        Optional<OtpToken> otpTokenOpt = otpRepository.findByEmail(normalizedEmail);
        
        if (otpTokenOpt.isEmpty()) {
            System.out.println("====== OTP DEBUG ======");
            System.out.println("Failure reason: No OTP found in DB for email '" + normalizedEmail + "'");
            log.error("[OtpService] \u274C Verification failed: No OTP found in DB for email '{}'", normalizedEmail);
            return false;
        }
        
        OtpToken otpToken = otpTokenOpt.get();
        Long currentTime = System.currentTimeMillis();
        
        System.out.println("====== OTP DEBUG ======");
        System.out.println("Stored OTP: " + otpToken.getOtp());
        System.out.println("Entered OTP: " + trimmedOtp);
        System.out.println("Expiry: " + otpToken.getExpiryTime());
        System.out.println("Now: " + currentTime);
        System.out.println("Time remaining (ms): " + (otpToken.getExpiryTime() - currentTime));
        
        log.info("[OtpService] Found stored OTP from DB. Expiry time: {}", otpToken.getExpiryTime());
        log.info("[OtpService] Current server time: {}", currentTime);
        
        if (currentTime > otpToken.getExpiryTime()) {
            System.out.println("Failure reason: OTP expired. DB Expiry is less than Now.");
            log.error("[OtpService] \u274C Verification failed: OTP for '{}' has expired.", normalizedEmail);
            // Optionally delete it or leave it marked as expired. Let's delete it.
            otpRepository.delete(otpToken);
            return false;
        }
        
        if (otpToken.getOtp().equals(trimmedOtp)) {
            System.out.println("Success! OTP matches and is not expired.");
            log.info("[OtpService] \u2705 Verification successful for email '{}'", normalizedEmail);
            otpToken.setVerified(true);
            otpRepository.save(otpToken);
            // We set verified = true. In isVerified() we will check if it's true.
            return true;
        }
        
        System.out.println("Failure reason: OTP mismatch. DB=" + otpToken.getOtp() + " vs Input=" + trimmedOtp);
        log.error("[OtpService] \u274C Verification failed: OTP mismatch. DB='{}', Input='{}'", otpToken.getOtp(), trimmedOtp);
        return false;
    }

    public boolean isVerified(String email) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        Optional<OtpToken> otpTokenOpt = otpRepository.findByEmail(normalizedEmail);
        return otpTokenOpt.map(OtpToken::isVerified).orElse(false);
    }
    
    @Transactional
    public void clearVerification(String email) {
        String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
        otpRepository.deleteByEmail(normalizedEmail);
        log.info("[OtpService] Cleared OTP verification for email '{}'", normalizedEmail);
    }
}
