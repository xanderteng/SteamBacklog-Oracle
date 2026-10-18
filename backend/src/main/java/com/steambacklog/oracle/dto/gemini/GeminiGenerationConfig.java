package com.steambacklog.oracle.dto.gemini;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GeminiGenerationConfig(
        @JsonProperty("responseMimeType") String responseMimeType,
        @JsonProperty("temperature") Double temperature
) {
    public GeminiGenerationConfig(String responseMimeType) {
        this(responseMimeType, null);
    }
}
