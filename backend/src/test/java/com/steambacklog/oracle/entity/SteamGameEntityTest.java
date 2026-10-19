package com.steambacklog.oracle.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

class SteamGameEntityTest {

    @Test
    void testEntityAnnotationsAndInvariants() {
        assertNotNull(SteamGame.class.getAnnotation(Entity.class));
        assertNull(SteamGame.class.getAnnotation(Data.class), "Entity MUST NOT have @Data annotation");

        Table table = SteamGame.class.getAnnotation(Table.class);
        assertNotNull(table);
        assertEquals("steam_game", table.name());

        UniqueConstraint[] uniqueConstraints = table.uniqueConstraints();
        assertTrue(Arrays.stream(uniqueConstraints).anyMatch(uc ->
                Arrays.asList(uc.columnNames()).contains("steam_id") &&
                Arrays.asList(uc.columnNames()).contains("app_id")
        ));

        Index[] indexes = table.indexes();
        assertTrue(Arrays.stream(indexes).anyMatch(idx ->
                idx.columnList().contains("steam_id") && idx.columnList().contains("is_backlog")
        ));
    }

    @Test
    void testBacklogDefaultsOnCreate() {
        SteamGame untouchedGame = new SteamGame("76561198000000000", 100L, "Untouched Game", 0, "icon", null);
        untouchedGame.onCreate();
        assertTrue(untouchedGame.getIsBacklog());
        assertEquals(CompletionStatus.UNTOUCHED, untouchedGame.getCompletionStatus());
        assertNull(untouchedGame.getEstimatedClearMinutes());
        assertEquals(0, untouchedGame.getAchievementsUnlocked());
        assertEquals(0, untouchedGame.getAchievementsTotal());
        assertEquals(0.0, untouchedGame.getAchievementPercentage());
        assertNotNull(untouchedGame.getCreatedAt());
        assertNotNull(untouchedGame.getUpdatedAt());

        SteamGame inProgressGame = new SteamGame("76561198000000000", 200L, "In Progress Game", 150, "icon", null);
        inProgressGame.onCreate();
        assertTrue(inProgressGame.getIsBacklog());
        assertEquals(CompletionStatus.IN_PROGRESS, inProgressGame.getCompletionStatus());

        SteamGame completedGame = new SteamGame("76561198000000000", 300L, "Completed Game", 1200, "icon", false,
                600, 10, 10, 100.0, CompletionStatus.COMPLETED);
        completedGame.onCreate();
        assertFalse(completedGame.getIsBacklog());
        assertEquals(CompletionStatus.COMPLETED, completedGame.getCompletionStatus());
    }
}
