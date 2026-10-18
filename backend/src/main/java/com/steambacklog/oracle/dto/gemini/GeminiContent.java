package com.steambacklog.oracle.dto.gemini;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GeminiContent(
        @JsonProperty("parts") List<GeminiPart> parts,
        @JsonProperty("role") String role
) {
    public GeminiContent(List<GeminiPart> parts) {
        this(parts, null);
    }
}
