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
        resolveEstimates(games, false);
    }

    public void resolveEstimates(List<SteamGame> games, boolean forceRefresh) {
        if (games == null || games.isEmpty()) {
            return;
        }

        List<SteamGame> uncached = games.stream()
                .filter(g -> forceRefresh
                        || g.getEstimatedClearMinutes() == null
                        || g.getEstimatedClearMinutes() <= 0
                        || g.getEstimatedClearMinutes() == DEFAULT_CLEAR_MINUTES)
                .toList();

        if (uncached.isEmpty()) {
            return;
        }

        // Process in batches of at most 100 games to avoid unnecessary multi-batch rate limiting
        int batchSize = 100;
        for (int i = 0; i < uncached.size(); i += batchSize) {
            if (i > 0) {
                try {
                    Thread.sleep(2500);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
            }
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
            log.info("Successfully resolved {} HowLongToBeat estimates via Gemini for batch of {} games",
                    estimates.size(), batch.size());
        } catch (Exception e) {
            log.warn("Failed to resolve completion time estimates via Gemini, applying fallback of {} minutes: {}",
                    DEFAULT_CLEAR_MINUTES, e.getMessage());
        }

        for (SteamGame game : batch) {
            Integer estimate = estimates.get(game.getAppId());
            if (estimate != null && estimate > 0) {
                game.setEstimatedClearMinutes(estimate);
            } else if (game.getEstimatedClearMinutes() == null || game.getEstimatedClearMinutes() <= 0) {
                game.setEstimatedClearMinutes(DEFAULT_CLEAR_MINUTES);
            }
        }
    }

    private String buildPrompt(List<SteamGame> games) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert video game completion database evaluator with encyclopedic knowledge of HowLongToBeat (HLTB) metrics.\n");
        sb.append("For each of the following Steam video games, provide the authentic HowLongToBeat (HLTB) Main Story average completion time in minutes.\n");
        sb.append("Each game has a distinct, realistic completion time (for example: short games take 120-300m, medium story games take 600-900m, long RPGs take 1500-3000m). Provide the realistic playthrough time for each specific title.\n");
        sb.append("Return strictly a JSON array of objects with fields:\n");
        sb.append("- \"appId\": integer (exact AppID matching the game)\n");
        sb.append("- \"estimatedClearMinutes\": integer (average HowLongToBeat Main Story clear time in minutes, minimum 30)\n\n");
        sb.append("Games list:\n");
        for (SteamGame game : games) {
            sb.append("- AppID: ").append(game.getAppId())
                    .append(" | Title: ").append(game.getName())
                    .append("\n");
        }
        sb.append("\nStrict JSON array format example:\n");
        sb.append("[{\"appId\": 1057090, \"estimatedClearMinutes\": 900}]\n");
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
