package com.steambacklog.oracle.controller;

import com.steambacklog.oracle.dto.response.SteamGameResponse;
import com.steambacklog.oracle.dto.response.SyncSummaryResponse;
import com.steambacklog.oracle.exception.GlobalExceptionHandler;
import com.steambacklog.oracle.exception.InvalidSteamIdException;
import com.steambacklog.oracle.exception.SteamApiException;
import com.steambacklog.oracle.service.SteamSyncService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SteamSyncController.class)
@Import(GlobalExceptionHandler.class)
class SteamSyncControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SteamSyncService steamSyncService;

    private static final String STEAM_ID = "76561198000000000";

    @Test
    void syncLibrary_Returns200WithSummary() throws Exception {
        SyncSummaryResponse summary = new SyncSummaryResponse(STEAM_ID, 5, 2, 3);
        when(steamSyncService.syncLibrary(STEAM_ID)).thenReturn(summary);

        mockMvc.perform(post("/api/v1/steam/sync/{steamId}", STEAM_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.steamId").value(STEAM_ID))
                .andExpect(jsonPath("$.totalImported").value(5))
                .andExpect(jsonPath("$.totalUpdated").value(2))
                .andExpect(jsonPath("$.backlogCount").value(3));
    }

    @Test
    void getBacklog_Returns200WithGameList() throws Exception {
        SteamGameResponse game = new SteamGameResponse(
                1L,
                STEAM_ID,
                220L,
                "Half-Life 2",
                45,
                "hash123",
                true,
                600,
                5,
                20,
                25.0,
                com.steambacklog.oracle.entity.CompletionStatus.IN_PROGRESS
        );
        when(steamSyncService.getBacklogGames(STEAM_ID)).thenReturn(List.of(game));

        mockMvc.perform(get("/api/v1/steam/backlog/{steamId}", STEAM_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].steamId").value(STEAM_ID))
                .andExpect(jsonPath("$[0].appId").value(220))
                .andExpect(jsonPath("$[0].name").value("Half-Life 2"))
                .andExpect(jsonPath("$[0].playtimeForeverMinutes").value(45))
                .andExpect(jsonPath("$[0].imgIconUrl").value("hash123"))
                .andExpect(jsonPath("$[0].isBacklog").value(true))
                .andExpect(jsonPath("$[0].estimatedClearMinutes").value(600))
                .andExpect(jsonPath("$[0].achievementsUnlocked").value(5))
                .andExpect(jsonPath("$[0].achievementsTotal").value(20))
                .andExpect(jsonPath("$[0].achievementPercentage").value(25.0))
                .andExpect(jsonPath("$[0].completionStatus").value("IN_PROGRESS"));
    }

    @Test
    void syncLibrary_InvalidSteamId_Returns400ProblemDetail() throws Exception {
        String invalidSteamId = "abc";
        when(steamSyncService.syncLibrary(invalidSteamId))
                .thenThrow(new InvalidSteamIdException("Steam ID must be numeric"));

        mockMvc.perform(post("/api/v1/steam/sync/{steamId}", invalidSteamId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid Steam ID"))
                .andExpect(jsonPath("$.detail").value("Steam ID must be numeric"))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void syncLibrary_SteamApiFailure_Returns502ProblemDetail() throws Exception {
        when(steamSyncService.syncLibrary(STEAM_ID))
                .thenThrow(new SteamApiException("Steam API error: 500", 502));

        mockMvc.perform(post("/api/v1/steam/sync/{steamId}", STEAM_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.title").value("Steam API Error"))
                .andExpect(jsonPath("$.detail").value("Steam API error: 500"))
                .andExpect(jsonPath("$.status").value(502));
    }

    @Test
    void getSavedUsers_Returns200WithUserList() throws Exception {
        when(steamSyncService.getSavedSteamIds()).thenReturn(List.of(STEAM_ID, "76561198000000001"));

        mockMvc.perform(get("/api/v1/steam/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0]").value(STEAM_ID))
                .andExpect(jsonPath("$[1]").value("76561198000000001"));
    }

    @Test
    void getSavedSummary_Returns200WithSummary() throws Exception {
        SyncSummaryResponse summary = new SyncSummaryResponse(STEAM_ID, 42, 0, 35);
        when(steamSyncService.getSavedSummary(STEAM_ID)).thenReturn(summary);

        mockMvc.perform(get("/api/v1/steam/summary/{steamId}", STEAM_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.steamId").value(STEAM_ID))
                .andExpect(jsonPath("$.totalImported").value(42))
                .andExpect(jsonPath("$.backlogCount").value(35));
    }
}
