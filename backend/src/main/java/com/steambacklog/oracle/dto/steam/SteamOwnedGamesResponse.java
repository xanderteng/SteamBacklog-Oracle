package com.steambacklog.oracle.dto.steam;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SteamOwnedGamesResponse(
        @JsonProperty("response") SteamResponseContainer response
) {
}
