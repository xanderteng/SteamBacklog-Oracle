package com.steambacklog.oracle.service;

import com.steambacklog.oracle.dto.response.SteamGameResponse;
import com.steambacklog.oracle.dto.response.SyncSummaryResponse;
import com.steambacklog.oracle.dto.steam.SteamGameDto;
import com.steambacklog.oracle.dto.steam.SteamOwnedGamesResponse;
import com.steambacklog.oracle.dto.steam.SteamResponseContainer;
import com.steambacklog.oracle.entity.SteamGame;
import com.steambacklog.oracle.exception.InvalidSteamIdException;
import com.steambacklog.oracle.repository.SteamGameRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SteamSyncServiceTest {

    @Mock
    private SteamApiClient steamApiClient;

    @Mock
    private SteamGameRepository steamGameRepository;

    @Captor
    private ArgumentCaptor<List<SteamGame>> gamesCaptor;

    private SteamSyncService syncService;

    private static final String VALID_STEAM_ID = "76561198000000000";

    @BeforeEach
    void setUp() {
        syncService = new SteamSyncService(steamApiClient, steamGameRepository);
    }

    @Test
    void syncLibrary_InitialSync_PersistsNewGames() {
        SteamGameDto game1 = new SteamGameDto(10L, "Counter-Strike", 60, "icon1");
        SteamGameDto game2 = new SteamGameDto(20L, "Team Fortress 2", 300, "icon2");
        SteamOwnedGamesResponse apiResponse = new SteamOwnedGamesResponse(
                new SteamResponseContainer(2, List.of(game1, game2))
        );

        when(steamApiClient.getOwnedGames(VALID_STEAM_ID)).thenReturn(apiResponse);
        when(steamGameRepository.findBySteamId(VALID_STEAM_ID)).thenReturn(List.of());

        SyncSummaryResponse summary = syncService.syncLibrary(VALID_STEAM_ID);

        assertEquals(VALID_STEAM_ID, summary.steamId());
        assertEquals(2, summary.totalImported());
        assertEquals(0, summary.totalUpdated());
        assertEquals(1, summary.backlogCount());

        verify(steamGameRepository).saveAll(gamesCaptor.capture());
        List<SteamGame> saved = gamesCaptor.getValue();
        assertEquals(2, saved.size());

        SteamGame savedGame1 = saved.stream().filter(g -> g.getAppId().equals(10L)).findFirst().orElseThrow();
        assertTrue(savedGame1.getIsBacklog());
        assertEquals("Counter-Strike", savedGame1.getName());

        SteamGame savedGame2 = saved.stream().filter(g -> g.getAppId().equals(20L)).findFirst().orElseThrow();
        assertFalse(savedGame2.getIsBacklog());
        assertEquals("Team Fortress 2", savedGame2.getName());
    }

    @Test
    void syncLibrary_ReSync_UpdatesExistingGames() {
        SteamGame existing = new SteamGame(VALID_STEAM_ID, 10L, "Old Title", 50, "oldIcon", true);
        existing.setId(1L);

        SteamGameDto updated = new SteamGameDto(10L, "Updated Title", 180, "newIcon");
        SteamOwnedGamesResponse apiResponse = new SteamOwnedGamesResponse(
                new SteamResponseContainer(1, List.of(updated))
        );

        when(steamApiClient.getOwnedGames(VALID_STEAM_ID)).thenReturn(apiResponse);
        when(steamGameRepository.findBySteamId(VALID_STEAM_ID)).thenReturn(List.of(existing));

        SyncSummaryResponse summary = syncService.syncLibrary(VALID_STEAM_ID);

        assertEquals(0, summary.totalImported());
        assertEquals(1, summary.totalUpdated());
        assertEquals(0, summary.backlogCount());

        verify(steamGameRepository).saveAll(gamesCaptor.capture());
        List<SteamGame> saved = gamesCaptor.getValue();
        assertEquals(1, saved.size());
        SteamGame savedGame = saved.get(0);
        assertEquals("Updated Title", savedGame.getName());
        assertEquals(180, savedGame.getPlaytimeForeverMinutes());
        assertEquals("newIcon", savedGame.getImgIconUrl());
        assertFalse(savedGame.getIsBacklog(), "Game with 180 mins playtime must transition out of backlog");
    }

    @Test
    void syncLibrary_BacklogThreshold_BoundaryConditions() {
        SteamGameDto gameZero = new SteamGameDto(1L, "Zero Playtime", 0, "icon");
        SteamGameDto game119 = new SteamGameDto(2L, "119 Playtime", 119, "icon");
        SteamGameDto game120 = new SteamGameDto(3L, "120 Playtime", 120, "icon");
        SteamGameDto game121 = new SteamGameDto(4L, "121 Playtime", 121, "icon");

        SteamOwnedGamesResponse apiResponse = new SteamOwnedGamesResponse(
                new SteamResponseContainer(4, List.of(gameZero, game119, game120, game121))
        );

        when(steamApiClient.getOwnedGames(VALID_STEAM_ID)).thenReturn(apiResponse);
        when(steamGameRepository.findBySteamId(VALID_STEAM_ID)).thenReturn(List.of());

        SyncSummaryResponse summary = syncService.syncLibrary(VALID_STEAM_ID);

        assertEquals(4, summary.totalImported());
        assertEquals(2, summary.backlogCount());

        verify(steamGameRepository).saveAll(gamesCaptor.capture());
        List<SteamGame> saved = gamesCaptor.getValue();

        assertTrue(saved.stream().filter(g -> g.getAppId().equals(1L)).findFirst().orElseThrow().getIsBacklog());
        assertTrue(saved.stream().filter(g -> g.getAppId().equals(2L)).findFirst().orElseThrow().getIsBacklog());
        assertFalse(saved.stream().filter(g -> g.getAppId().equals(3L)).findFirst().orElseThrow().getIsBacklog());
        assertFalse(saved.stream().filter(g -> g.getAppId().equals(4L)).findFirst().orElseThrow().getIsBacklog());
    }

    @Test
    void syncLibrary_InvalidSteamId_ThrowsInvalidSteamIdException() {
        assertThrows(InvalidSteamIdException.class, () -> syncService.syncLibrary(null));
        assertThrows(InvalidSteamIdException.class, () -> syncService.syncLibrary(""));
        assertThrows(InvalidSteamIdException.class, () -> syncService.syncLibrary("   "));
        assertThrows(InvalidSteamIdException.class, () -> syncService.syncLibrary("invalid_steam_id"));
        verifyNoInteractions(steamApiClient);
        verifyNoInteractions(steamGameRepository);
    }

    @Test
    void getBacklogGames_Success() {
        SteamGame game1 = new SteamGame(VALID_STEAM_ID, 10L, "Game 1", 30, "icon1", true);
        game1.setId(101L);
        SteamGame game2 = new SteamGame(VALID_STEAM_ID, 20L, "Game 2", 90, "icon2", true);
        game2.setId(102L);

        when(steamGameRepository.findBySteamIdAndIsBacklogTrue(VALID_STEAM_ID)).thenReturn(List.of(game1, game2));

        List<SteamGameResponse> result = syncService.getBacklogGames(VALID_STEAM_ID);

        assertEquals(2, result.size());
        assertEquals(101L, result.get(0).id());
        assertEquals(VALID_STEAM_ID, result.get(0).steamId());
        assertEquals(10L, result.get(0).appId());
        assertEquals("Game 1", result.get(0).name());
        assertTrue(result.get(0).isBacklog());

        assertEquals(102L, result.get(1).id());
        assertEquals(20L, result.get(1).appId());
    }

    @Test
    void getBacklogGames_InvalidSteamId_ThrowsInvalidSteamIdException() {
        assertThrows(InvalidSteamIdException.class, () -> syncService.getBacklogGames(null));
        assertThrows(InvalidSteamIdException.class, () -> syncService.getBacklogGames(""));
        assertThrows(InvalidSteamIdException.class, () -> syncService.getBacklogGames("abc"));
        verifyNoInteractions(steamGameRepository);
    }
}
