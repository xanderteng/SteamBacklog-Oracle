package com.steambacklog.oracle.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.steambacklog.oracle.dto.GameClearTimeEstimate;
import com.steambacklog.oracle.entity.SteamGame;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CompletionTimeEstimator {

    private static final Logger log = LoggerFactory.getLogger(CompletionTimeEstimator.class);
    public static final int DEFAULT_CLEAR_MINUTES = 600;

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public CompletionTimeEstimator(GeminiClient geminiClient, ObjectMapper objectMapper) {
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper;
    }

    public void resolveEstimates(List<SteamGame> games) {
        if (games == null || games.isEmpty()) {
            return;
        }

        List<SteamGame> uncached = games.stream()
                .filter(g -> g.getEstimatedClearMinutes() == null || g.getEstimatedClearMinutes() <= 0)
                .toList();

        if (uncached.isEmpty()) {
            return;
        }

        // Process in batches of at most 50 games
        int batchSize = 50;
        for (int i = 0; i < uncached.size(); i += batchSize) {
            List<SteamGame> batch = uncached.subList(i, Math.min(i + batchSize, uncached.size()));
            resolveBatch(batch);
        }
    }

    private void resolveBatch(List<SteamGame> batch) {
        Map<Long, Integer> estimates = new HashMap<>();
        try {
            String prompt = buildPrompt(batch);
            String rawResponse = geminiClient.generateContent(prompt);
            String cleanedJson = extractJson(rawResponse);
            List<GameClearTimeEstimate> resultList = objectMapper.readValue(cleanedJson, new TypeReference<>() {});

            if (resultList != null) {
                for (GameClearTimeEstimate est : resultList) {
                    if (est.appId() != null && est.estimatedClearMinutes() != null && est.estimatedClearMinutes() > 0) {
                        estimates.put(est.appId(), est.estimatedClearMinutes());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to resolve completion time estimates via Gemini, applying fallback of {} minutes: {}",
                    DEFAULT_CLEAR_MINUTES, e.getMessage());
        }

        for (SteamGame game : batch) {
            Integer estimate = estimates.get(game.getAppId());
            if (estimate != null && estimate > 0) {
                game.setEstimatedClearMinutes(estimate);
            } else {
                game.setEstimatedClearMinutes(DEFAULT_CLEAR_MINUTES);
            }
        }
    }

    private String buildPrompt(List<SteamGame> games) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert video game completion time evaluator. Estimate the average HowLongToBeat (HLTB) ");
        sb.append("Main Story completion time in minutes for each of the following Steam games.\n");
        sb.append("Respond strictly with a JSON array of objects with fields \"appId\" (number) and \"estimatedClearMinutes\" (number, minimum 30).\n\n");
        sb.append("Games to estimate:\n");
        for (SteamGame game : games) {
            sb.append("- AppID: ").append(game.getAppId())
                    .append(" | Name: ").append(game.getName())
                    .append("\n");
        }
        sb.append("\nJSON array format:\n");
        sb.append("[{\"appId\": 12345, \"estimatedClearMinutes\": 480}]\n");
        return sb.toString();
    }

    private String extractJson(String text) {
        if (text == null) {
            return "[]";
        }
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
