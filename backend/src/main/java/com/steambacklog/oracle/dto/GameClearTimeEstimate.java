package com.steambacklog.oracle.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GameClearTimeEstimate(
        @JsonProperty("appId") Long appId,
        @JsonProperty("estimatedClearMinutes") Integer estimatedClearMinutes
) {
}
