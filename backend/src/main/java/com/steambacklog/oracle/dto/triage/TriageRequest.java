package com.steambacklog.oracle.dto.triage;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record TriageRequest(
        @NotBlank(message = "Mood cannot be blank")
        String mood,

        @Min(value = 5, message = "Available minutes must be at least 5")
        int availableMinutes,

        Integer maxRecommendations
) {
    public int resolvedMaxRecommendations() {
        return (maxRecommendations != null && maxRecommendations > 0) ? maxRecommendations : 3;
    }
}
