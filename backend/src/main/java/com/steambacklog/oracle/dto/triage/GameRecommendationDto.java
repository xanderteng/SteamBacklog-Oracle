package com.steambacklog.oracle.dto.triage;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.steambacklog.oracle.entity.CompletionStatus;

public record GameRecommendationDto(
        @JsonProperty("appId") Long appId,
        @JsonProperty("name") String name,
        @JsonProperty("playtimeForeverMinutes") int playtimeForeverMinutes,
        @JsonProperty("imgIconUrl") String imgIconUrl,
        @JsonProperty("matchScore") int matchScore,
        @JsonProperty("whyPlayNow") String whyPlayNow,
        @JsonProperty("estimatedSessionMinutes") int estimatedSessionMinutes,
        @JsonProperty("estimatedClearMinutes") Integer estimatedClearMinutes,
        @JsonProperty("achievementsUnlocked") Integer achievementsUnlocked,
        @JsonProperty("achievementsTotal") Integer achievementsTotal,
        @JsonProperty("achievementPercentage") Double achievementPercentage,
        @JsonProperty("completionStatus") CompletionStatus completionStatus
) {
    public GameRecommendationDto(
            Long appId,
            String name,
            int playtimeForeverMinutes,
            String imgIconUrl,
            int matchScore,
            String whyPlayNow,
            int estimatedSessionMinutes
    ) {
        this(appId, name, playtimeForeverMinutes, imgIconUrl, matchScore, whyPlayNow, estimatedSessionMinutes,
                null, 0, 0, 0.0,
                (playtimeForeverMinutes > 0 ? CompletionStatus.IN_PROGRESS : CompletionStatus.UNTOUCHED));
    }
}
