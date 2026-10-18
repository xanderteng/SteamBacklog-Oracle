package com.steambacklog.oracle.dto.response;

import com.steambacklog.oracle.entity.SteamGame;

public record SteamGameResponse(
        Long id,
        String steamId,
        Long appId,
        String name,
        Integer playtimeForeverMinutes,
        String imgIconUrl,
        Boolean isBacklog
) {
    public static SteamGameResponse fromEntity(SteamGame entity) {
        return new SteamGameResponse(
                entity.getId(),
                entity.getSteamId(),
                entity.getAppId(),
                entity.getName(),
                entity.getPlaytimeForeverMinutes(),
                entity.getImgIconUrl(),
                entity.getIsBacklog()
        );
    }
}
