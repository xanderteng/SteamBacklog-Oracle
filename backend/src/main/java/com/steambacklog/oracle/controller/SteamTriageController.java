package com.steambacklog.oracle.controller;

import com.steambacklog.oracle.dto.triage.TriageRequest;
import com.steambacklog.oracle.dto.triage.TriageResponse;
import com.steambacklog.oracle.service.AiTriageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/steam")
public class SteamTriageController {

    private final AiTriageService aiTriageService;

    public SteamTriageController(AiTriageService aiTriageService) {
        this.aiTriageService = aiTriageService;
    }

    @PostMapping("/backlog/{steamId}/triage")
    public ResponseEntity<TriageResponse> triageBacklog(
            @PathVariable("steamId") String steamId,
            @Valid @RequestBody TriageRequest request
    ) {
        TriageResponse response = aiTriageService.triageBacklog(steamId, request);
        return ResponseEntity.ok(response);
    }
}
