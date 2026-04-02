package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        log.info("[OAuth2] ✅ Google login successful — processing user...");

        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");

            log.info("[OAuth2] Authenticated Google user: email={}, name={}", email, name);

            User user = userRepository.findByEmail(email);

            if (user == null) {
                log.info("[OAuth2] New user — creating account for: {}", email);
                user = new User();
                user.setEmail(email);
                user.setName(name != null ? name : email);
                user.setRole(User.Role.STUDENT);
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                userRepository.save(user);
                log.info("[OAuth2] New user saved successfully: {}", email);
            } else {
                log.info("[OAuth2] Existing user found: {}", email);
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            log.info("[OAuth2] JWT generated for user: {}. Redirecting to: {}", email, frontendUrl + "/home?token=...");

            response.sendRedirect(frontendUrl + "/home?token=" + token);

        } catch (Exception e) {
            log.error("[OAuth2] \u274C Error during OAuth2 success handling: {}", e.getMessage(), e);
            response.sendRedirect(frontendUrl + "/login?error=oauth_failed");
        }
    }
}
