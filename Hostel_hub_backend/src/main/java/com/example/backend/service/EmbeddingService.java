package com.example.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    @Value("${embedding.service.url:http://localhost:5000}")
    private String embeddingServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calls the Python microservice to generate sentence embeddings for the given text.
     * Returns a float array containing the 384-dimensional embedding, or null if the call fails.
     */
    public float[] getEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        String url = embeddingServiceUrl + "/embed";
        log.info("[EmbeddingService] Calling embedding service at: {}", url);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", text);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<EmbeddingResponse> response = restTemplate.postForEntity(url, request, EmbeddingResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Double> embeddingList = response.getBody().getEmbedding();
                if (embeddingList != null && !embeddingList.isEmpty()) {
                    float[] embedding = new float[embeddingList.size()];
                    for (int i = 0; i < embeddingList.size(); i++) {
                        embedding[i] = embeddingList.get(i).floatValue();
                    }
                    log.info("[EmbeddingService] Successfully generated embedding with dimensions: {}", embedding.length);
                    return embedding;
                }
            }
            log.warn("[EmbeddingService] Received empty or invalid response from embedding service.");
        } catch (Exception e) {
            log.error("[EmbeddingService] Failed to generate embedding from Python service: {}. Falling back to keyword/normal processing.", 
                e.getMessage());
        }
        return null;
    }

    /**
     * Simple response class matching the JSON format of the Flask embedding service.
     */
    public static class EmbeddingResponse {
        private List<Double> embedding;

        public List<Double> getEmbedding() {
            return embedding;
        }

        public void setEmbedding(List<Double> embedding) {
            this.embedding = embedding;
        }
    }
}
