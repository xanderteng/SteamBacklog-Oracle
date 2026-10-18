package com.steambacklog.oracle.service;

import com.steambacklog.oracle.dto.response.SteamGameResponse;
import com.steambacklog.oracle.dto.response.SyncSummaryResponse;
import com.steambacklog.oracle.dto.steam.SteamGameDto;
import com.steambacklog.oracle.dto.steam.SteamOwnedGamesResponse;
import com.steambacklog.oracle.entity.SteamGame;
import com.steambacklog.oracle.exception.InvalidSteamIdException;
import com.steambacklog.oracle.repository.SteamGameRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SteamSyncService {

    private static final int BACKLOG_PLAYTIME_THRESHOLD_MINUTES = 120;

    private final SteamApiClient steamApiClient;
    private final SteamGameRepository steamGameRepository;

    public SteamSyncService(SteamApiClient steamApiClient, SteamGameRepository steamGameRepository) {
        this.steamApiClient = steamApiClient;
        this.steamGameRepository = steamGameRepository;
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
        int backlogCount = 0;
        List<SteamGame> toSave = new ArrayList<>();

        for (SteamGameDto incoming : incomingGames) {
            long appId = incoming.appid();
            String name = (incoming.name() != null && !incoming.name().isBlank())
                    ? incoming.name()
                    : "App " + appId;
            int playtime = incoming.playtimeForever();
            boolean isBacklog = (playtime < BACKLOG_PLAYTIME_THRESHOLD_MINUTES);

            if (isBacklog) {
                backlogCount++;
            }

            if (existingByAppId.containsKey(appId)) {
                SteamGame existing = existingByAppId.get(appId);
                existing.setName(name);
                existing.setPlaytimeForeverMinutes(playtime);
                existing.setImgIconUrl(incoming.imgIconUrl());
                existing.setIsBacklog(isBacklog);
                toSave.add(existing);
                totalUpdated++;
            } else {
                SteamGame newGame = new SteamGame(
                        steamId,
                        appId,
                        name,
                        playtime,
                        incoming.imgIconUrl(),
                        isBacklog
                );
                toSave.add(newGame);
                totalImported++;
            }
        }

        if (!toSave.isEmpty()) {
            steamGameRepository.saveAll(toSave);
        }

        return new SyncSummaryResponse(steamId, totalImported, totalUpdated, backlogCount);
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
