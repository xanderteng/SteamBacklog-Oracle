package com.steambacklog.oracle.dto.steam;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SteamPlayerAchievementsResponse(
        @JsonProperty("playerstats") PlayerStats playerstats
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PlayerStats(
            @JsonProperty("steamID") String steamID,
            @JsonProperty("gameName") String gameName,
            @JsonProperty("achievements") List<AchievementItem> achievements,
            @JsonProperty("success") Boolean success,
            @JsonProperty("error") String error
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AchievementItem(
            @JsonProperty("apiname") String apiname,
            @JsonProperty("achieved") int achieved,
            @JsonProperty("unlocktime") Long unlocktime
    ) {}
}
