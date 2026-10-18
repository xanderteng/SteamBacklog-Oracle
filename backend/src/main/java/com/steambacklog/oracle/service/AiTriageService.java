package com.steambacklog.oracle.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.steambacklog.oracle.dto.triage.GameRecommendationDto;
import com.steambacklog.oracle.dto.triage.TriageRequest;
import com.steambacklog.oracle.dto.triage.TriageResponse;
import com.steambacklog.oracle.entity.SteamGame;
import com.steambacklog.oracle.exception.EmptyBacklogException;
import com.steambacklog.oracle.exception.GeminiApiException;
import com.steambacklog.oracle.exception.InvalidSteamIdException;
import com.steambacklog.oracle.repository.SteamGameRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AiTriageService {

    private static final Logger log = LoggerFactory.getLogger(AiTriageService.class);
    private static final int MAX_PROMPT_CANDIDATES = 50;

    private final SteamGameRepository steamGameRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    public AiTriageService(SteamGameRepository steamGameRepository,
                            GeminiClient geminiClient,
                            ObjectMapper objectMapper) {
        this.steamGameRepository = steamGameRepository;
        this.geminiClient = geminiClient;
        this.objectMapper = objectMapper;
    }

    public TriageResponse triageBacklog(String steamId, TriageRequest request) {
        if (steamId == null || steamId.isBlank()) {
            throw new InvalidSteamIdException("Steam ID cannot be blank");
        }

        List<SteamGame> backlogGames = steamGameRepository.findBySteamIdAndIsBacklogTrue(steamId);
        if (backlogGames == null || backlogGames.isEmpty()) {
            throw new EmptyBacklogException("No backlog games found for Steam ID: " + steamId);
        }

        List<SteamGame> candidates = backlogGames.stream()
                .limit(MAX_PROMPT_CANDIDATES)
                .toList();

        Map<Long, SteamGame> candidateMap = candidates.stream()
                .collect(Collectors.toMap(SteamGame::getAppId, Function.identity(), (first, second) -> first));

        String prompt = buildPrompt(request, candidates);
        log.debug("Invoking Gemini triage for steamId={}, candidatesCount={}", steamId, candidates.size());
        String rawLlmResponse = geminiClient.generateContent(prompt);

        return processLlmResponse(steamId, request, rawLlmResponse, candidateMap);
    }

    private String buildPrompt(TriageRequest request, List<SteamGame> candidates) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert video game backlog triage advisor.\n");
        sb.append("Analyze the user's backlog games and recommend the best games to play right now based on their mood and available time.\n\n");
        sb.append("User Parameters:\n");
        sb.append("- Player Mood: ").append(request.mood()).append("\n");
        sb.append("- Available Time: ").append(request.availableMinutes()).append(" minutes\n");
        sb.append("- Target Recommendations Count: ").append(request.resolvedMaxRecommendations()).append("\n\n");
        sb.append("Candidate Backlog Games (CRITICAL: You MUST choose ONLY from these games):\n");

        for (SteamGame game : candidates) {
            sb.append("- AppID: ").append(game.getAppId())
                    .append(" | Title: ").append(game.getName())
                    .append(" | Playtime So Far: ").append(game.getPlaytimeForeverMinutes() != null ? game.getPlaytimeForeverMinutes() : 0).append(" minutes\n");
        }

        sb.append("\nReturn a JSON object adhering exactly to this schema:\n");
        sb.append("{\n");
        sb.append("  \"playerPersonaSummary\": \"Insightful 1-2 sentence summary of player gaming profile and current mood\",\n");
        sb.append("  \"recommendations\": [\n");
        sb.append("    {\n");
        sb.append("      \"appId\": <exact number matching candidate AppID>,\n");
        sb.append("      \"name\": \"<exact title of the candidate game>\",\n");
        sb.append("      \"matchScore\": <integer between 0 and 100>,\n");
        sb.append("      \"whyPlayNow\": \"<concise explanation connecting the game to their mood and time limit>\",\n");
        sb.append("      \"estimatedSessionMinutes\": <estimated session duration in minutes <= available time>\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}\n");

        return sb.toString();
    }

    private TriageResponse processLlmResponse(String steamId,
                                              TriageRequest request,
                                              String rawLlmResponse,
                                              Map<Long, SteamGame> candidateMap) {
        try {
            String cleanJson = cleanJsonResponse(rawLlmResponse);
            LlmTriagePayload payload = objectMapper.readValue(cleanJson, LlmTriagePayload.class);

            String personaSummary = (payload.playerPersonaSummary() != null && !payload.playerPersonaSummary().isBlank())
                    ? payload.playerPersonaSummary()
                    : "Backlog triage tailored to your mood and available time.";

            int maxRecs = request.resolvedMaxRecommendations();
            List<LlmRecommendationItem> items = payload.recommendations() != null ? payload.recommendations() : List.of();

            List<GameRecommendationDto> recommendations = items.stream()
                    .filter(Objects::nonNull)
                    .filter(item -> item.appId() != null && candidateMap.containsKey(item.appId()))
                    .limit(maxRecs)
                    .map(item -> {
                        SteamGame authoritativeGame = candidateMap.get(item.appId());
                        return new GameRecommendationDto(
                                authoritativeGame.getAppId(),
                                authoritativeGame.getName(),
                                authoritativeGame.getPlaytimeForeverMinutes() != null ? authoritativeGame.getPlaytimeForeverMinutes() : 0,
                                authoritativeGame.getImgIconUrl(),
                                item.matchScore() != null ? item.matchScore() : 85,
                                (item.whyPlayNow() != null && !item.whyPlayNow().isBlank())
                                        ? item.whyPlayNow()
                                        : "Great match for your current session.",
                                item.estimatedSessionMinutes() != null && item.estimatedSessionMinutes() > 0
                                        ? item.estimatedSessionMinutes()
                                        : request.availableMinutes()
                        );
                    })
                    .toList();

            return new TriageResponse(steamId, personaSummary, recommendations);
        } catch (Exception e) {
            log.error("Failed to parse Gemini triage JSON response: {}", rawLlmResponse, e);
            throw new GeminiApiException("Failed to parse LLM triage response: " + e.getMessage(), 502, e);
        }
    }

    private String cleanJsonResponse(String response) {
        if (response == null) {
            return "{}";
        }
        String trimmed = response.trim();
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

    record LlmTriagePayload(
            @JsonProperty("playerPersonaSummary") String playerPersonaSummary,
            @JsonProperty("recommendations") List<LlmRecommendationItem> recommendations
    ) {}

    record LlmRecommendationItem(
            @JsonProperty("appId") Long appId,
            @JsonProperty("name") String name,
            @JsonProperty("matchScore") Integer matchScore,
            @JsonProperty("whyPlayNow") String whyPlayNow,
            @JsonProperty("estimatedSessionMinutes") Integer estimatedSessionMinutes
    ) {}
}
