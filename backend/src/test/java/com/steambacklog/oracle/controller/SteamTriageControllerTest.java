package com.steambacklog.oracle.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.steambacklog.oracle.dto.triage.GameRecommendationDto;
import com.steambacklog.oracle.dto.triage.TriageRequest;
import com.steambacklog.oracle.dto.triage.TriageResponse;
import com.steambacklog.oracle.exception.EmptyBacklogException;
import com.steambacklog.oracle.exception.GeminiApiException;
import com.steambacklog.oracle.exception.GlobalExceptionHandler;
import com.steambacklog.oracle.service.AiTriageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SteamTriageController.class)
@Import(GlobalExceptionHandler.class)
class SteamTriageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiTriageService aiTriageService;

    private static final String STEAM_ID = "76561198000000000";

    @Test
    @DisplayName("Should return 200 OK with triage recommendations on valid request")
    void triageBacklog_validRequest_returns200OkWithResponse() throws Exception {
        TriageRequest request = new TriageRequest("deep narrative RPG", 90, 2);
        GameRecommendationDto rec = new GameRecommendationDto(
                1091500L,
                "Cyberpunk 2077",
                45,
                "cyberpunk_icon.jpg",
                96,
                "Matches your immersive storytelling mood.",
                90
        );
        TriageResponse expectedResponse = new TriageResponse(
                STEAM_ID,
                "Player looking for deep atmospheric immersion.",
                List.of(rec)
        );

        when(aiTriageService.triageBacklog(eq(STEAM_ID), any(TriageRequest.class)))
                .thenReturn(expectedResponse);

        mockMvc.perform(post("/api/v1/steam/backlog/{steamId}/triage", STEAM_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.steamId").value(STEAM_ID))
                .andExpect(jsonPath("$.playerPersonaSummary").value("Player looking for deep atmospheric immersion."))
                .andExpect(jsonPath("$.recommendations[0].appId").value(1091500))
                .andExpect(jsonPath("$.recommendations[0].name").value("Cyberpunk 2077"))
                .andExpect(jsonPath("$.recommendations[0].matchScore").value(96))
                .andExpect(jsonPath("$.recommendations[0].whyPlayNow").value("Matches your immersive storytelling mood."))
                .andExpect(jsonPath("$.recommendations[0].estimatedSessionMinutes").value(90));
    }

    @Test
    @DisplayName("Should return 400 Bad Request ProblemDetail when mood is blank")
    void triageBacklog_blankMood_returns400ProblemDetail() throws Exception {
        TriageRequest request = new TriageRequest("", 60, 2);

        mockMvc.perform(post("/api/v1/steam/backlog/{steamId}/triage", STEAM_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Failed"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("Mood cannot be blank")));
    }

    @Test
    @DisplayName("Should return 400 Bad Request ProblemDetail when available minutes is less than 5")
    void triageBacklog_insufficientAvailableMinutes_returns400ProblemDetail() throws Exception {
        TriageRequest request = new TriageRequest("casual", 2, 2);

        mockMvc.perform(post("/api/v1/steam/backlog/{steamId}/triage", STEAM_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Failed"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("Available minutes must be at least 5")));
    }

    @Test
    @DisplayName("Should return 404 Not Found ProblemDetail when backlog is empty")
    void triageBacklog_emptyBacklog_returns404ProblemDetail() throws Exception {
        TriageRequest request = new TriageRequest("chill", 60, 2);

        when(aiTriageService.triageBacklog(eq(STEAM_ID), any(TriageRequest.class)))
                .thenThrow(new EmptyBacklogException("No backlog games found for Steam ID: " + STEAM_ID));

        mockMvc.perform(post("/api/v1/steam/backlog/{steamId}/triage", STEAM_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Empty Backlog"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.detail").value("No backlog games found for Steam ID: " + STEAM_ID));
    }

    @Test
    @DisplayName("Should return 502 Bad Gateway ProblemDetail when upstream Gemini fails")
    void triageBacklog_geminiFailure_returns502ProblemDetail() throws Exception {
        TriageRequest request = new TriageRequest("chill", 60, 2);

        when(aiTriageService.triageBacklog(eq(STEAM_ID), any(TriageRequest.class)))
                .thenThrow(new GeminiApiException("Gemini upstream service unavailable", 502));

        mockMvc.perform(post("/api/v1/steam/backlog/{steamId}/triage", STEAM_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.title").value("Gemini API Error"))
                .andExpect(jsonPath("$.status").value(502))
                .andExpect(jsonPath("$.detail").value("Gemini upstream service unavailable"));
    }
}
