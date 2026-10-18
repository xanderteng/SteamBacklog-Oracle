package com.steambacklog.oracle.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeminiCandidate(
        @JsonProperty("content") GeminiContent content,
        @JsonProperty("finishReason") String finishReason,
        @JsonProperty("index") Integer index
) {
}
