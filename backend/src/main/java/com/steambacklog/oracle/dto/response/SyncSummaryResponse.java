package com.steambacklog.oracle.dto.response;

public record SyncSummaryResponse(
        String steamId,
        int totalImported,
        int totalUpdated,
        int backlogCount
) {
}
