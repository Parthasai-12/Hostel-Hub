package com.example.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EmbeddingUtil {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingUtil.class);

    /**
     * Calculates the cosine similarity between two float vectors.
     */
    public static double cosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null) {
            log.warn("[EmbeddingUtil] Cannot compute cosine similarity: one or both vectors are null.");
            return 0.0;
        }
        if (vectorA.length != vectorB.length) {
            log.warn("[EmbeddingUtil] Cannot compute cosine similarity: vector dimension mismatch ({} vs {}).", 
                vectorA.length, vectorB.length);
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            log.warn("[EmbeddingUtil] Cannot compute cosine similarity: one or both vectors have zero norm.");
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Serializes a float array to a comma-separated String.
     */
    public static String serializeEmbedding(float[] embedding) {
        if (embedding == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < embedding.length; i++) {
            sb.append(embedding[i]);
            if (i < embedding.length - 1) {
                sb.append(",");
            }
        }
        return sb.toString();
    }

    /**
     * Deserializes a comma-separated String to a float array.
     */
    public static float[] deserializeEmbedding(String embeddingStr) {
        if (embeddingStr == null || embeddingStr.trim().isEmpty()) {
            return null;
        }
        try {
            String[] parts = embeddingStr.split(",");
            float[] embedding = new float[parts.length];
            for (int i = 0; i < parts.length; i++) {
                embedding[i] = Float.parseFloat(parts[i].trim());
            }
            return embedding;
        } catch (NumberFormatException e) {
            log.error("[EmbeddingUtil] Failed to deserialize embedding string: {}", embeddingStr, e);
            return null;
        }
    }

    /**
     * Extracts a normalized block/hostel identifier from a room number string.
     * Examples:
     * - "Block A - 101" -> "A"
     * - "Block-B-Room 202" -> "B"
     * - "A-102" -> "A"
     * - "B204" -> "B"
     * - "104" -> "104" (fallback)
     */
    public static String extractBlock(String roomNumber) {
        if (roomNumber == null || roomNumber.trim().isEmpty()) {
            return "";
        }
        String normalized = roomNumber.trim().toUpperCase();
        
        // Pattern 1: "Block A - 101" or "Block A Room 101" -> extract "A"
        if (normalized.startsWith("BLOCK")) {
            String suffix = normalized.substring(5).trim();
            if (!suffix.isEmpty()) {
                String[] parts = suffix.split("[\\s\\-_]+");
                if (parts.length > 0 && !parts[0].isEmpty()) {
                    return parts[0];
                }
            }
        }
        
        // Pattern 2: "A-101" or "A 101" or "A_101" -> extract "A"
        String[] parts = normalized.split("[\\s\\-_]+");
        if (parts.length > 0 && !parts[0].isEmpty()) {
            String candidate = parts[0];
            if (candidate.matches(".*[A-Z].*")) {
                return candidate;
            }
        }
        
        // Pattern 3: "A101" or "B304" -> extract leading letters
        StringBuilder letters = new StringBuilder();
        for (int i = 0; i < normalized.length(); i++) {
            char ch = normalized.charAt(i);
            if (Character.isLetter(ch)) {
                letters.append(ch);
            } else {
                break;
            }
        }
        if (letters.length() > 0) {
            return letters.toString();
        }
        
        // Fallback: just return the normalized room number
        return normalized;
    }

    /**
     * Normalizes a text snippet by converting to lowercase, removing punctuation, 
     * and trimming extra spaces.
     */
    public static String normalizeText(String text) {
        if (text == null) {
            return "";
        }
        // lowercase
        String normalized = text.toLowerCase();
        // remove punctuation (keep alphanumeric and spaces)
        normalized = normalized.replaceAll("[^a-zA-Z0-9\\s]", " ");
        // trim spaces and collapse multiple spaces into one
        normalized = normalized.trim().replaceAll("\\s+", " ");
        return normalized;
    }
}
