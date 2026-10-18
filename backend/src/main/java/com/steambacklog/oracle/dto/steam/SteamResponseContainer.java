package com.steambacklog.oracle.dto.steam;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record SteamResponseContainer(
        @JsonProperty("game_count") int gameCount,
        @JsonProperty("games") List<SteamGameDto> games
) {
    public SteamResponseContainer {
        if (games == null) {
            games = List.of();
        }
    }
}
