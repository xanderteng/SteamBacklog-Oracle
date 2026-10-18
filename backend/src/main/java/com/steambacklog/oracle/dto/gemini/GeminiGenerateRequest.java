package com.steambacklog.oracle.dto.gemini;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GeminiGenerateRequest(
        @JsonProperty("contents") List<GeminiContent> contents,
        @JsonProperty("generationConfig") GeminiGenerationConfig generationConfig
) {
    public static GeminiGenerateRequest of(String prompt, String responseMimeType) {
        return new GeminiGenerateRequest(
                List.of(new GeminiContent(List.of(new GeminiPart(prompt)))),
                new GeminiGenerationConfig(responseMimeType)
        );
    }
}
