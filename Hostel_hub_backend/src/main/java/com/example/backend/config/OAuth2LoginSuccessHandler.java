package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // Used natively matching AuthService
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        User user = userRepository.findByEmail(email);

        if (user == null) {
            // Register new user
            user = new User();
            user.setEmail(email);
            user.setName(name != null ? name : email);
            user.setRole(User.Role.STUDENT);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Generate random secure password
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Redirect to frontend login component with token
        response.sendRedirect(frontendUrl + "/login?token=" + token);
    }
}
