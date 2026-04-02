package com.example.backend.util;

import com.example.backend.entity.ComplaintCategory;
import java.util.List;
import java.util.Map;
import java.util.Arrays;
import java.util.stream.Collectors;

public class ComplaintCategorizer {

    private static final Map<ComplaintCategory, List<String>> KEYWORDS = Map.of(
        ComplaintCategory.FOOD, Arrays.asList("food", "mess", "breakfast", "lunch", "dinner", "meal", "taste"),
        ComplaintCategory.ELECTRICITY, Arrays.asList("electricity", "power", "light", "fan", "socket", "switch"),
        ComplaintCategory.CLEANLINESS, Arrays.asList("dirty", "garbage", "smell", "washroom", "toilet", "cleaning"),
        ComplaintCategory.WATER, Arrays.asList("water", "tap", "leakage", "pipe", "bathroom water"),
        ComplaintCategory.INTERNET, Arrays.asList("wifi", "internet", "network", "slow internet"),
        ComplaintCategory.MAINTENANCE, Arrays.asList("door", "window", "bed", "table", "chair", "fan repair", "bulb broken", "infrastructure", "wall damage", "ceiling", "plumbing repair")
    );

    public static ComplaintCategory categorize(String description) {
        if (description == null || description.trim().isEmpty()) {
            return ComplaintCategory.OTHER;
        }

        String lowerDesc = description.toLowerCase();

        for (Map.Entry<ComplaintCategory, List<String>> entry : KEYWORDS.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (lowerDesc.contains(keyword)) {
                    return entry.getKey();
                }
            }
        }

        return ComplaintCategory.OTHER;
    }
}
