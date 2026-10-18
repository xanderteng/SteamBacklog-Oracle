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
        SteamGame backlogGame = new SteamGame("76561198000000000", 100L, "Backlog Game", 90, "icon", null);
        backlogGame.onCreate();
        assertTrue(backlogGame.getIsBacklog());
        assertNotNull(backlogGame.getCreatedAt());
        assertNotNull(backlogGame.getUpdatedAt());

        SteamGame playedGame = new SteamGame("76561198000000000", 200L, "Played Game", 150, "icon", null);
        playedGame.onCreate();
        assertFalse(playedGame.getIsBacklog());

        SteamGame thresholdGame = new SteamGame("76561198000000000", 300L, "Threshold Game", 120, "icon", null);
        thresholdGame.onCreate();
        assertFalse(thresholdGame.getIsBacklog());
    }
}
