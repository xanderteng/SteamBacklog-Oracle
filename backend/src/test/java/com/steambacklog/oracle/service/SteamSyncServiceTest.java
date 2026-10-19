package com.steambacklog.oracle.service;

import com.steambacklog.oracle.dto.response.SteamGameResponse;
import com.steambacklog.oracle.dto.response.SyncSummaryResponse;
import com.steambacklog.oracle.dto.steam.PlayerAchievementsDto;
import com.steambacklog.oracle.dto.steam.SteamGameDto;
import com.steambacklog.oracle.dto.steam.SteamOwnedGamesResponse;
import com.steambacklog.oracle.dto.steam.SteamResponseContainer;
import com.steambacklog.oracle.entity.CompletionStatus;
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
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SteamSyncServiceTest {

    @Mock
    private SteamApiClient steamApiClient;

    @Mock
    private SteamGameRepository steamGameRepository;

    @Mock
    private CompletionTimeEstimator completionTimeEstimator;

    @Captor
    private ArgumentCaptor<List<SteamGame>> gamesCaptor;

    private SteamSyncService syncService;

    private static final String VALID_STEAM_ID = "76561198000000000";

    @BeforeEach
    void setUp() {
        syncService = new SteamSyncService(steamApiClient, steamGameRepository, completionTimeEstimator);
    }

    @Test
    void syncLibrary_InitialSync_PersistsNewGamesAndEvaluatesStatus() {
        SteamGameDto game1 = new SteamGameDto(10L, "Counter-Strike", 0, "icon1");
        SteamGameDto game2 = new SteamGameDto(20L, "Team Fortress 2", 300, "icon2");
        SteamOwnedGamesResponse apiResponse = new SteamOwnedGamesResponse(
                new SteamResponseContainer(2, List.of(game1, game2))
        );

        when(steamApiClient.getOwnedGames(VALID_STEAM_ID)).thenReturn(apiResponse);
        when(steamGameRepository.findBySteamId(VALID_STEAM_ID)).thenReturn(List.of());
        doAnswer(invocation -> {
            List<SteamGame> games = invocation.getArgument(0);
            for (SteamGame g : games) {
                if (g.getAppId() == 10L) g.setEstimatedClearMinutes(600);
                if (g.getAppId() == 20L) g.setEstimatedClearMinutes(1200);
            }
            return null;
        }).when(completionTimeEstimator).resolveEstimates(anyList());

        when(steamApiClient.getPlayerAchievements(VALID_STEAM_ID, 20L))
                .thenReturn(PlayerAchievementsDto.of(5, 20));

        SyncSummaryResponse summary = syncService.syncLibrary(VALID_STEAM_ID);

        assertEquals(VALID_STEAM_ID, summary.steamId());
        assertEquals(2, summary.totalImported());
        assertEquals(0, summary.totalUpdated());
        assertEquals(2, summary.backlogCount()); // both untouched and in-progress (300 < 1200)

        verify(steamApiClient, never()).getPlayerAchievements(VALID_STEAM_ID, 10L); // playtime 0 -> no achievement query
        verify(steamApiClient, times(1)).getPlayerAchievements(VALID_STEAM_ID, 20L);

        verify(steamGameRepository).saveAll(gamesCaptor.capture());
        List<SteamGame> saved = gamesCaptor.getValue();
        assertEquals(2, saved.size());

        SteamGame savedGame1 = saved.stream().filter(g -> g.getAppId().equals(10L)).findFirst().orElseThrow();
        assertTrue(savedGame1.getIsBacklog());
        assertEquals(CompletionStatus.UNTOUCHED, savedGame1.getCompletionStatus());
        assertEquals("Counter-Strike", savedGame1.getName());

        SteamGame savedGame2 = saved.stream().filter(g -> g.getAppId().equals(20L)).findFirst().orElseThrow();
        assertTrue(savedGame2.getIsBacklog());
        assertEquals(CompletionStatus.IN_PROGRESS, savedGame2.getCompletionStatus());
        assertEquals(5, savedGame2.getAchievementsUnlocked());
        assertEquals(20, savedGame2.getAchievementsTotal());
        assertEquals(25.0, savedGame2.getAchievementPercentage());
    }

    @Test
    void syncLibrary_ReSync_TransitionsCompletedByPlaytime() {
        SteamGame existing = new SteamGame(VALID_STEAM_ID, 10L, "Epic RPG", 500, "oldIcon", true);
        existing.setId(1L);
        existing.setEstimatedClearMinutes(600);
        existing.setCompletionStatus(CompletionStatus.IN_PROGRESS);

        SteamGameDto updated = new SteamGameDto(10L, "Epic RPG", 650, "newIcon");
        SteamOwnedGamesResponse apiResponse = new SteamOwnedGamesResponse(
                new SteamResponseContainer(1, List.of(updated))
        );

        when(steamApiClient.getOwnedGames(VALID_STEAM_ID)).thenReturn(apiResponse);
        when(steamGameRepository.findBySteamId(VALID_STEAM_ID)).thenReturn(List.of(existing));
        when(steamApiClient.getPlayerAchievements(VALID_STEAM_ID, 10L))
                .thenReturn(PlayerAchievementsDto.of(8, 20));

        SyncSummaryResponse summary = syncService.syncLibrary(VALID_STEAM_ID);

        assertEquals(0, summary.totalImported());
        assertEquals(1, summary.totalUpdated());
        assertEquals(0, summary.backlogCount(), "Completed game must not be counted in backlog");

        verify(steamGameRepository).saveAll(gamesCaptor.capture());
        List<SteamGame> saved = gamesCaptor.getValue();
        assertEquals(1, saved.size());
        SteamGame savedGame = saved.get(0);
        assertEquals(650, savedGame.getPlaytimeForeverMinutes());
        assertFalse(savedGame.getIsBacklog(), "Game exceeding estimated clear minutes must be COMPLETED and not backlog");
        assertEquals(CompletionStatus.COMPLETED, savedGame.getCompletionStatus());
    }

    @Test
    void syncLibrary_100PercentAchievements_MarksCompletedEvenIfPlaytimeUnderClearTime() {
        SteamGameDto game = new SteamGameDto(50L, "Short Adventure", 120, "icon");
        SteamOwnedGamesResponse apiResponse = new SteamOwnedGamesResponse(
                new SteamResponseContainer(1, List.of(game))
        );

        when(steamApiClient.getOwnedGames(VALID_STEAM_ID)).thenReturn(apiResponse);
        when(steamGameRepository.findBySteamId(VALID_STEAM_ID)).thenReturn(List.of());
        doAnswer(invocation -> {
            List<SteamGame> games = invocation.getArgument(0);
            games.get(0).setEstimatedClearMinutes(600); // 600 mins clear time, but played only 120
            return null;
        }).when(completionTimeEstimator).resolveEstimates(anyList());

        when(steamApiClient.getPlayerAchievements(VALID_STEAM_ID, 50L))
                .thenReturn(PlayerAchievementsDto.of(15, 15)); // 100% unlocked!

        SyncSummaryResponse summary = syncService.syncLibrary(VALID_STEAM_ID);

        assertEquals(1, summary.totalImported());
        assertEquals(0, summary.backlogCount());

        verify(steamGameRepository).saveAll(gamesCaptor.capture());
        SteamGame savedGame = gamesCaptor.getValue().get(0);
        assertFalse(savedGame.getIsBacklog());
        assertEquals(CompletionStatus.COMPLETED, savedGame.getCompletionStatus());
        assertEquals(15, savedGame.getAchievementsUnlocked());
        assertEquals(15, savedGame.getAchievementsTotal());
        assertEquals(100.0, savedGame.getAchievementPercentage());
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
        SteamGame game1 = new SteamGame(VALID_STEAM_ID, 10L, "Game 1", 30, "icon1", true,
                480, 5, 20, 25.0, CompletionStatus.IN_PROGRESS);
        game1.setId(101L);
        SteamGame game2 = new SteamGame(VALID_STEAM_ID, 20L, "Game 2", 0, "icon2", true,
                600, 0, 0, 0.0, CompletionStatus.UNTOUCHED);
        game2.setId(102L);

        when(steamGameRepository.findBySteamIdAndIsBacklogTrue(VALID_STEAM_ID)).thenReturn(List.of(game1, game2));

        List<SteamGameResponse> result = syncService.getBacklogGames(VALID_STEAM_ID);

        assertEquals(2, result.size());
        assertEquals(101L, result.get(0).id());
        assertEquals(VALID_STEAM_ID, result.get(0).steamId());
        assertEquals(10L, result.get(0).appId());
        assertEquals("Game 1", result.get(0).name());
        assertEquals(480, result.get(0).estimatedClearMinutes());
        assertEquals(5, result.get(0).achievementsUnlocked());
        assertEquals(20, result.get(0).achievementsTotal());
        assertEquals(25.0, result.get(0).achievementPercentage());
        assertEquals(CompletionStatus.IN_PROGRESS, result.get(0).completionStatus());
        assertTrue(result.get(0).isBacklog());

        assertEquals(102L, result.get(1).id());
        assertEquals(CompletionStatus.UNTOUCHED, result.get(1).completionStatus());
    }

    @Test
    void getBacklogGames_InvalidSteamId_ThrowsInvalidSteamIdException() {
        assertThrows(InvalidSteamIdException.class, () -> syncService.getBacklogGames(null));
        assertThrows(InvalidSteamIdException.class, () -> syncService.getBacklogGames(""));
        assertThrows(InvalidSteamIdException.class, () -> syncService.getBacklogGames("abc"));
        verifyNoInteractions(steamGameRepository);
    }
}
