package com.steambacklog.oracle.controller;

import com.steambacklog.oracle.dto.response.SteamGameResponse;
import com.steambacklog.oracle.dto.response.SyncSummaryResponse;
import com.steambacklog.oracle.service.SteamSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/steam")
public class SteamSyncController {

    private final SteamSyncService steamSyncService;

    public SteamSyncController(SteamSyncService steamSyncService) {
        this.steamSyncService = steamSyncService;
    }

    @PostMapping("/sync/{steamId}")
    public ResponseEntity<SyncSummaryResponse> syncLibrary(@PathVariable("steamId") String steamId) {
        SyncSummaryResponse summary = steamSyncService.syncLibrary(steamId);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/backlog/{steamId}")
    public ResponseEntity<List<SteamGameResponse>> getBacklog(@PathVariable("steamId") String steamId) {
        List<SteamGameResponse> backlog = steamSyncService.getBacklogGames(steamId);
        return ResponseEntity.ok(backlog);
    }
}
