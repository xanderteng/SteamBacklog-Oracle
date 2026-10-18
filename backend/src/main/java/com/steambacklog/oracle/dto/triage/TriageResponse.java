package com.steambacklog.oracle.dto.triage;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TriageResponse(
        @JsonProperty("steamId") String steamId,
        @JsonProperty("playerPersonaSummary") String playerPersonaSummary,
        @JsonProperty("recommendations") List<GameRecommendationDto> recommendations
) {
    public TriageResponse {
        if (recommendations == null) {
            recommendations = List.of();
        }
    }
}
