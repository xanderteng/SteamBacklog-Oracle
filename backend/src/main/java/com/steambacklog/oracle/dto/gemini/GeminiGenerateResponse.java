package com.steambacklog.oracle.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeminiGenerateResponse(
        @JsonProperty("candidates") List<GeminiCandidate> candidates
) {
    public String getFirstText() {
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }
        GeminiCandidate candidate = candidates.get(0);
        if (candidate.content() == null || candidate.content().parts() == null || candidate.content().parts().isEmpty()) {
            return null;
        }
        return candidate.content().parts().get(0).text();
    }
}
