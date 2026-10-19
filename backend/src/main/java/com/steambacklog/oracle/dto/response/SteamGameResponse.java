package com.steambacklog.oracle.dto.response;

import com.steambacklog.oracle.entity.CompletionStatus;
import com.steambacklog.oracle.entity.SteamGame;

public record SteamGameResponse(
        Long id,
        String steamId,
        Long appId,
        String name,
        Integer playtimeForeverMinutes,
        String imgIconUrl,
        Boolean isBacklog,
        Integer estimatedClearMinutes,
        Integer achievementsUnlocked,
        Integer achievementsTotal,
        Double achievementPercentage,
        CompletionStatus completionStatus
) {
    public SteamGameResponse(
            Long id,
            String steamId,
            Long appId,
            String name,
            Integer playtimeForeverMinutes,
            String imgIconUrl,
            Boolean isBacklog
    ) {
        this(id, steamId, appId, name, playtimeForeverMinutes, imgIconUrl, isBacklog,
                null, 0, 0, 0.0,
                (isBacklog != null && !isBacklog
                        ? CompletionStatus.COMPLETED
                        : (playtimeForeverMinutes != null && playtimeForeverMinutes > 0
                        ? CompletionStatus.IN_PROGRESS
                        : CompletionStatus.UNTOUCHED)));
    }

    public static SteamGameResponse fromEntity(SteamGame entity) {
        return new SteamGameResponse(
                entity.getId(),
                entity.getSteamId(),
                entity.getAppId(),
                entity.getName(),
                entity.getPlaytimeForeverMinutes(),
                entity.getImgIconUrl(),
                entity.getIsBacklog(),
                entity.getEstimatedClearMinutes(),
                entity.getAchievementsUnlocked(),
                entity.getAchievementsTotal(),
                entity.getAchievementPercentage(),
                entity.getCompletionStatus()
        );
    }
}
