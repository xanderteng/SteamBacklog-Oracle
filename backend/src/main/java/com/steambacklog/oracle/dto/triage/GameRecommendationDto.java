package com.steambacklog.oracle.dto.triage;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GameRecommendationDto(
        @JsonProperty("appId") Long appId,
        @JsonProperty("name") String name,
        @JsonProperty("playtimeForeverMinutes") int playtimeForeverMinutes,
        @JsonProperty("imgIconUrl") String imgIconUrl,
        @JsonProperty("matchScore") int matchScore,
        @JsonProperty("whyPlayNow") String whyPlayNow,
        @JsonProperty("estimatedSessionMinutes") int estimatedSessionMinutes
) {
}
