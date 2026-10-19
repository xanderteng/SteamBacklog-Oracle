package com.steambacklog.oracle.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.steambacklog.oracle.entity.SteamGame;
import com.steambacklog.oracle.exception.GeminiApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompletionTimeEstimatorTest {

    @Mock
    private GeminiClient geminiClient;

    private CompletionTimeEstimator estimator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        estimator = new CompletionTimeEstimator(geminiClient, objectMapper);
    }

    @Test
    void resolveEstimates_CachedGamesNotQueried() {
        SteamGame cachedGame = new SteamGame("76561198000000000", 100L, "Cached Game", 60, "icon", true);
        cachedGame.setEstimatedClearMinutes(420);

        estimator.resolveEstimates(List.of(cachedGame));

        assertEquals(420, cachedGame.getEstimatedClearMinutes());
        verifyNoInteractions(geminiClient);
    }

    @Test
    void resolveEstimates_Success() {
        SteamGame game1 = new SteamGame("76561198000000000", 100L, "Sonic Mania", 45, "icon", true);
        SteamGame game2 = new SteamGame("76561198000000000", 200L, "Nine Sols", 120, "icon", true);

        String jsonResponse = """
                [
                  {"appId": 100, "estimatedClearMinutes": 360},
                  {"appId": 200, "estimatedClearMinutes": 900}
                ]
                """;
        when(geminiClient.generateContent(anyString())).thenReturn(jsonResponse);

        estimator.resolveEstimates(List.of(game1, game2));

        assertEquals(360, game1.getEstimatedClearMinutes());
        assertEquals(900, game2.getEstimatedClearMinutes());
        verify(geminiClient, times(1)).generateContent(anyString());
    }

    @Test
    void resolveEstimates_GeminiError_AppliesFallback() {
        SteamGame game = new SteamGame("76561198000000000", 100L, "Some Game", 0, "icon", true);
        when(geminiClient.generateContent(anyString())).thenThrow(new GeminiApiException("Quota exceeded", 429));

        estimator.resolveEstimates(List.of(game));

        assertEquals(CompletionTimeEstimator.DEFAULT_CLEAR_MINUTES, game.getEstimatedClearMinutes());
    }

    @Test
    void resolveEstimates_PartialResults_AppliesFallbackToMissing() {
        SteamGame game1 = new SteamGame("76561198000000000", 100L, "Game 1", 0, "icon", true);
        SteamGame game2 = new SteamGame("76561198000000000", 200L, "Game 2", 0, "icon", true);

        String jsonResponse = """
                [
                  {"appId": 100, "estimatedClearMinutes": 450}
                ]
                """;
        when(geminiClient.generateContent(anyString())).thenReturn(jsonResponse);

        estimator.resolveEstimates(List.of(game1, game2));

        assertEquals(450, game1.getEstimatedClearMinutes());
        assertEquals(CompletionTimeEstimator.DEFAULT_CLEAR_MINUTES, game2.getEstimatedClearMinutes());
    }
}
