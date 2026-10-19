package com.steambacklog.oracle.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.steambacklog.oracle.dto.triage.TriageRequest;
import com.steambacklog.oracle.dto.triage.TriageResponse;
import com.steambacklog.oracle.entity.SteamGame;
import com.steambacklog.oracle.exception.EmptyBacklogException;
import com.steambacklog.oracle.exception.GeminiApiException;
import com.steambacklog.oracle.exception.InvalidSteamIdException;
import com.steambacklog.oracle.repository.SteamGameRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiTriageServiceTest {

    @Mock
    private SteamGameRepository steamGameRepository;

    @Mock
    private GeminiClient geminiClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private AiTriageService aiTriageService;

    @BeforeEach
    void setUp() {
        aiTriageService = new AiTriageService(steamGameRepository, geminiClient, objectMapper);
    }

    @Test
    @DisplayName("Should successfully triage backlog and enrich recommendations with authoritative entity metadata")
    void triageBacklog_success_returnsEnrichedRecommendations() {
        String steamId = "76561198000000001";
        SteamGame game1 = new SteamGame(steamId, 1145360L, "Hades", 45, "hades_icon.jpg", true,
                1200, 10, 49, 20.4, com.steambacklog.oracle.entity.CompletionStatus.IN_PROGRESS);
        SteamGame game2 = new SteamGame(steamId, 367520L, "Hollow Knight", 0, "hk_icon.jpg", true,
                1800, 0, 0, 0.0, com.steambacklog.oracle.entity.CompletionStatus.UNTOUCHED);

        when(steamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)).thenReturn(List.of(game1, game2));

        String mockGeminiJson = """
                {
                  "playerPersonaSummary": "Tactical rogue-lite enthusiast seeking an engaging challenge.",
                  "recommendations": [
                    {
                      "appId": 1145360,
                      "name": "Hades",
                      "matchScore": 95,
                      "whyPlayNow": "Fast-paced escape runs fit your 60-minute window perfectly.",
                      "estimatedSessionMinutes": 45
                    }
                  ]
                }
                """;
        when(geminiClient.generateContent(anyString())).thenReturn(mockGeminiJson);

        TriageRequest request = new TriageRequest("focused action", 60, 2);
        TriageResponse response = aiTriageService.triageBacklog(steamId, request);

        assertThat(response.steamId()).isEqualTo(steamId);
        assertThat(response.playerPersonaSummary()).contains("Tactical rogue-lite enthusiast");
        assertThat(response.recommendations()).hasSize(1);

        var rec = response.recommendations().getFirst();
        assertThat(rec.appId()).isEqualTo(1145360L);
        assertThat(rec.name()).isEqualTo("Hades");
        assertThat(rec.playtimeForeverMinutes()).isEqualTo(45);
        assertThat(rec.imgIconUrl()).isEqualTo("hades_icon.jpg");
        assertThat(rec.matchScore()).isEqualTo(95);
        assertThat(rec.whyPlayNow()).contains("Fast-paced escape runs");
        assertThat(rec.estimatedSessionMinutes()).isEqualTo(45);
        assertThat(rec.estimatedClearMinutes()).isEqualTo(1200);
        assertThat(rec.achievementsUnlocked()).isEqualTo(10);
        assertThat(rec.achievementsTotal()).isEqualTo(49);
        assertThat(rec.achievementPercentage()).isEqualTo(20.4);
        assertThat(rec.completionStatus()).isEqualTo(com.steambacklog.oracle.entity.CompletionStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("Should throw EmptyBacklogException when user has no backlog games")
    void triageBacklog_emptyBacklog_throwsEmptyBacklogException() {
        String steamId = "76561198000000002";
        when(steamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)).thenReturn(List.of());

        TriageRequest request = new TriageRequest("relaxing", 45, 3);

        assertThatThrownBy(() -> aiTriageService.triageBacklog(steamId, request))
                .isInstanceOf(EmptyBacklogException.class)
                .hasMessageContaining("No backlog games found");

        verifyNoInteractions(geminiClient);
    }

    @Test
    @DisplayName("Should throw InvalidSteamIdException when steamId is blank")
    void triageBacklog_blankSteamId_throwsInvalidSteamIdException() {
        TriageRequest request = new TriageRequest("relaxing", 45, 3);

        assertThatThrownBy(() -> aiTriageService.triageBacklog("   ", request))
                .isInstanceOf(InvalidSteamIdException.class)
                .hasMessageContaining("Steam ID cannot be blank");

        verifyNoInteractions(steamGameRepository);
        verifyNoInteractions(geminiClient);
    }

    @Test
    @DisplayName("Should bound prompt candidate games to maximum 50 items")
    void triageBacklog_boundsCandidatesTo50() {
        String steamId = "76561198000000003";
        List<SteamGame> seventyGames = new ArrayList<>();
        for (int i = 1; i <= 70; i++) {
            seventyGames.add(new SteamGame(steamId, (long) i, "Game " + i, 10, "icon_" + i + ".jpg", true));
        }

        when(steamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)).thenReturn(seventyGames);

        String mockGeminiJson = """
                {
                  "playerPersonaSummary": "Diverse gamer with a huge library.",
                  "recommendations": [
                    {
                      "appId": 1,
                      "name": "Game 1",
                      "matchScore": 90,
                      "whyPlayNow": "Quick session",
                      "estimatedSessionMinutes": 30
                    }
                  ]
                }
                """;
        when(geminiClient.generateContent(anyString())).thenReturn(mockGeminiJson);

        TriageRequest request = new TriageRequest("casual", 30, 1);
        aiTriageService.triageBacklog(steamId, request);

        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        verify(geminiClient).generateContent(promptCaptor.capture());

        String prompt = promptCaptor.getValue();
        assertThat(prompt).contains("AppID: 1 |");
        assertThat(prompt).contains("AppID: 50 |");
        assertThat(prompt).doesNotContain("AppID: 51 |");
        assertThat(prompt).doesNotContain("AppID: 70 |");
    }

    @Test
    @DisplayName("Should filter out hallucinated app IDs and respect maxRecommendations limit")
    void triageBacklog_filtersHallucinatedAppIds_andRespectsMaxRecommendations() {
        String steamId = "76561198000000004";
        SteamGame realGame1 = new SteamGame(steamId, 100L, "Real Game 1", 0, "r1.jpg", true);
        SteamGame realGame2 = new SteamGame(steamId, 200L, "Real Game 2", 15, "r2.jpg", true);

        when(steamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)).thenReturn(List.of(realGame1, realGame2));

        String mockGeminiJson = """
                {
                  "playerPersonaSummary": "Story-driven explorer.",
                  "recommendations": [
                    {
                      "appId": 999999,
                      "name": "Hallucinated Fantasy VII",
                      "matchScore": 99,
                      "whyPlayNow": "Invented game",
                      "estimatedSessionMinutes": 60
                    },
                    {
                      "appId": 100,
                      "name": "Real Game 1",
                      "matchScore": 92,
                      "whyPlayNow": "Great match",
                      "estimatedSessionMinutes": 45
                    },
                    {
                      "appId": 200,
                      "name": "Real Game 2",
                      "matchScore": 88,
                      "whyPlayNow": "Secondary match",
                      "estimatedSessionMinutes": 30
                    }
                  ]
                }
                """;
        when(geminiClient.generateContent(anyString())).thenReturn(mockGeminiJson);

        // Requested maxRecommendations = 1
        TriageRequest request = new TriageRequest("story", 60, 1);
        TriageResponse response = aiTriageService.triageBacklog(steamId, request);

        assertThat(response.recommendations()).hasSize(1);
        assertThat(response.recommendations().getFirst().appId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("Should propagate GeminiApiException when upstream GeminiClient fails")
    void triageBacklog_upstreamGeminiError_propagatesException() {
        String steamId = "76561198000000005";
        SteamGame game = new SteamGame(steamId, 100L, "Game A", 10, "icon.jpg", true);
        when(steamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)).thenReturn(List.of(game));

        when(geminiClient.generateContent(anyString()))
                .thenThrow(new GeminiApiException("Gemini rate limit exceeded", 429));

        TriageRequest request = new TriageRequest("energetic", 60, 3);

        assertThatThrownBy(() -> aiTriageService.triageBacklog(steamId, request))
                .isInstanceOf(GeminiApiException.class)
                .hasMessageContaining("Gemini rate limit exceeded");
    }

    @Test
    @DisplayName("Should throw GeminiApiException when Gemini returns invalid JSON")
    void triageBacklog_invalidJsonResponse_throwsGeminiApiException() {
        String steamId = "76561198000000006";
        SteamGame game = new SteamGame(steamId, 100L, "Game A", 10, "icon.jpg", true);
        when(steamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)).thenReturn(List.of(game));

        when(geminiClient.generateContent(anyString())).thenReturn("This is not valid JSON at all!");

        TriageRequest request = new TriageRequest("chill", 45, 2);

        assertThatThrownBy(() -> aiTriageService.triageBacklog(steamId, request))
                .isInstanceOf(GeminiApiException.class)
                .hasMessageContaining("Failed to parse LLM triage response");
    }

    @Test
    @DisplayName("Should handle markdown wrapped JSON in Gemini response")
    void triageBacklog_markdownWrappedJson_parsesSuccessfully() {
        String steamId = "76561198000000007";
        SteamGame game = new SteamGame(steamId, 100L, "Game A", 10, "icon.jpg", true);
        when(steamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)).thenReturn(List.of(game));

        String markdownJson = "```json\n" +
                "{\n" +
                "  \"playerPersonaSummary\": \"Quick session seeker.\",\n" +
                "  \"recommendations\": [\n" +
                "    {\n" +
                "      \"appId\": 100,\n" +
                "      \"name\": \"Game A\",\n" +
                "      \"matchScore\": 89,\n" +
                "      \"whyPlayNow\": \"Fits perfectly.\",\n" +
                "      \"estimatedSessionMinutes\": 30\n" +
                "    }\n" +
                "  ]\n" +
                "}\n" +
                "```";
        when(geminiClient.generateContent(anyString())).thenReturn(markdownJson);

        TriageRequest request = new TriageRequest("chill", 45, 2);
        TriageResponse response = aiTriageService.triageBacklog(steamId, request);

        assertThat(response.recommendations()).hasSize(1);
        assertThat(response.recommendations().getFirst().appId()).isEqualTo(100L);
    }
}
