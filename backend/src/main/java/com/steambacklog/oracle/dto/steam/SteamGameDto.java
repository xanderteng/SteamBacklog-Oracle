package com.steambacklog.oracle.dto.steam;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SteamGameDto(
        @JsonProperty("appid") long appid,
        @JsonProperty("name") String name,
        @JsonProperty("playtime_forever") int playtimeForever,
        @JsonProperty("img_icon_url") String imgIconUrl
) {
}
