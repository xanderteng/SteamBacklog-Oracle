package com.steambacklog.oracle.service;

import com.steambacklog.oracle.dto.response.SteamGameResponse;
import com.steambacklog.oracle.dto.response.SyncSummaryResponse;
import com.steambacklog.oracle.dto.steam.PlayerAchievementsDto;
import com.steambacklog.oracle.dto.steam.SteamGameDto;
import com.steambacklog.oracle.dto.steam.SteamOwnedGamesResponse;
import com.steambacklog.oracle.entity.CompletionStatus;
import com.steambacklog.oracle.entity.SteamGame;
import com.steambacklog.oracle.exception.InvalidSteamIdException;
import com.steambacklog.oracle.repository.SteamGameRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

@Service
public class SteamSyncService {

    private static final Logger log = LoggerFactory.getLogger(SteamSyncService.class);

    private final SteamApiClient steamApiClient;
    private final SteamGameRepository steamGameRepository;
    private final CompletionTimeEstimator completionTimeEstimator;

    public SteamSyncService(SteamApiClient steamApiClient,
                            SteamGameRepository steamGameRepository,
                            CompletionTimeEstimator completionTimeEstimator) {
        this.steamApiClient = steamApiClient;
        this.steamGameRepository = steamGameRepository;
        this.completionTimeEstimator = completionTimeEstimator;
    }

    @Transactional
    public SyncSummaryResponse syncLibrary(String steamId) {
        validateSteamId(steamId);

        SteamOwnedGamesResponse apiResponse = steamApiClient.getOwnedGames(steamId);
        List<SteamGameDto> incomingGames = apiResponse.response() != null && apiResponse.response().games() != null
                ? apiResponse.response().games()
                : List.of();

        List<SteamGame> existingGames = steamGameRepository.findBySteamId(steamId);
        Map<Long, SteamGame> existingByAppId = existingGames.stream()
                .collect(Collectors.toMap(SteamGame::getAppId, g -> g));

        int totalImported = 0;
        int totalUpdated = 0;
        List<SteamGame> toSave = new ArrayList<>();

        for (SteamGameDto incoming : incomingGames) {
            long appId = incoming.appid();
            String name = (incoming.name() != null && !incoming.name().isBlank())
                    ? incoming.name()
                    : "App " + appId;
            int playtime = incoming.playtimeForever();

            if (existingByAppId.containsKey(appId)) {
                SteamGame existing = existingByAppId.get(appId);
                existing.setName(name);
                existing.setPlaytimeForeverMinutes(playtime);
                existing.setImgIconUrl(incoming.imgIconUrl());
                toSave.add(existing);
                totalUpdated++;
            } else {
                SteamGame newGame = new SteamGame(
                        steamId,
                        appId,
                        name,
                        playtime,
                        incoming.imgIconUrl(),
                        true
                );
                toSave.add(newGame);
                totalImported++;
            }
        }

        // 1. Resolve estimated clear times for new or unestimated games
        completionTimeEstimator.resolveEstimates(toSave);

        // 2. Fetch player achievements concurrently using Virtual Threads bounded by Semaphore(10)
        fetchAchievementsConcurrently(steamId, toSave);

        // 3. Evaluate completion status and backlog flag dynamically
        int backlogCount = 0;
        for (SteamGame game : toSave) {
            int playtime = game.getPlaytimeForeverMinutes() != null ? game.getPlaytimeForeverMinutes() : 0;
            int clearMinutes = game.getEstimatedClearMinutes() != null && game.getEstimatedClearMinutes() > 0
                    ? game.getEstimatedClearMinutes()
                    : CompletionTimeEstimator.DEFAULT_CLEAR_MINUTES;
            int totalAch = game.getAchievementsTotal() != null ? game.getAchievementsTotal() : 0;
            int unlockedAch = game.getAchievementsUnlocked() != null ? game.getAchievementsUnlocked() : 0;

            boolean isCompleted = (totalAch > 0 && unlockedAch == totalAch) || (playtime >= clearMinutes);

            if (isCompleted) {
                game.setIsBacklog(false);
                game.setCompletionStatus(CompletionStatus.COMPLETED);
            } else if (playtime == 0) {
                game.setIsBacklog(true);
                game.setCompletionStatus(CompletionStatus.UNTOUCHED);
                backlogCount++;
            } else {
                game.setIsBacklog(true);
                game.setCompletionStatus(CompletionStatus.IN_PROGRESS);
                backlogCount++;
            }
        }

        if (!toSave.isEmpty()) {
            steamGameRepository.saveAll(toSave);
        }

        return new SyncSummaryResponse(steamId, totalImported, totalUpdated, backlogCount);
    }

    private void fetchAchievementsConcurrently(String steamId, List<SteamGame> games) {
        List<SteamGame> playedGames = games.stream()
                .filter(g -> g.getPlaytimeForeverMinutes() != null && g.getPlaytimeForeverMinutes() > 0)
                .toList();

        if (playedGames.isEmpty()) {
            return;
        }

        Semaphore semaphore = new Semaphore(10);
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = playedGames.stream()
                    .map(game -> executor.submit(() -> {
                        try {
                            semaphore.acquire();
                            try {
                                PlayerAchievementsDto ach = steamApiClient.getPlayerAchievements(steamId, game.getAppId());
                                game.setAchievementsUnlocked(ach.unlocked());
                                game.setAchievementsTotal(ach.total());
                                game.setAchievementPercentage(ach.percentage());
                            } finally {
                                semaphore.release();
                            }
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        } catch (Exception e) {
                            log.debug("Failed to fetch achievements for appId {}: {}", game.getAppId(), e.getMessage());
                        }
                    }))
                    .toList();

            for (var f : futures) {
                try {
                    f.get();
                } catch (Exception e) {
                    log.debug("Error awaiting achievement task: {}", e.getMessage());
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<SteamGameResponse> getBacklogGames(String steamId) {
        validateSteamId(steamId);
        return steamGameRepository.findBySteamIdAndIsBacklogTrue(steamId)
                .stream()
                .map(SteamGameResponse::fromEntity)
                .toList();
    }

    private void validateSteamId(String steamId) {
        if (steamId == null || steamId.isBlank() || !steamId.matches("\\d+")) {
            throw new InvalidSteamIdException("Steam ID must be a non-blank numeric string: " + steamId);
        }
    }
}
