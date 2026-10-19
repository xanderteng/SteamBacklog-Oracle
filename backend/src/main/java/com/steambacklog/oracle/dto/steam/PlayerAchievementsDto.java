package com.steambacklog.oracle.dto.steam;

public record PlayerAchievementsDto(
        int unlocked,
        int total,
        double percentage
) {
    public static PlayerAchievementsDto empty() {
        return new PlayerAchievementsDto(0, 0, 0.0);
    }

    public static PlayerAchievementsDto of(int unlocked, int total) {
        if (total <= 0) {
            return new PlayerAchievementsDto(0, 0, 0.0);
        }
        double percentage = Math.round(((double) unlocked / total) * 1000.0) / 10.0;
        return new PlayerAchievementsDto(unlocked, total, percentage);
    }
}
