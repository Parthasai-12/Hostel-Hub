package com.example.backend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class UploadLoggingFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(UploadLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String requestURI = httpRequest.getRequestURI();
        if (requestURI.startsWith("/uploads/")) {
            log.info("Static resource request received: URI = {}, Method = {}", requestURI, httpRequest.getMethod());
        }
        chain.doFilter(request, response);
    }
}
