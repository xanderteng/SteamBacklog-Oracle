package com.steambacklog.oracle.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.steambacklog.oracle.dto.response.SteamGameResponse;
import com.steambacklog.oracle.dto.triage.GameRecommendationDto;
import com.steambacklog.oracle.entity.CompletionStatus;
import com.steambacklog.oracle.entity.SteamGame;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CompletionDtoSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testSteamGameResponseFromEntityAndJson() throws Exception {
        SteamGame entity = new SteamGame(
                "76561198835584593",
                584400L,
                "Sonic Mania",
                45,
                "c329b28adc1eb1ae73c9d4df9d9e48d7ea63bd86",
                true,
                360,
                5,
                20,
                25.0,
                CompletionStatus.IN_PROGRESS
        );

        SteamGameResponse response = SteamGameResponse.fromEntity(entity);
        assertEquals(584400L, response.appId());
        assertEquals("Sonic Mania", response.name());
        assertEquals(360, response.estimatedClearMinutes());
        assertEquals(5, response.achievementsUnlocked());
        assertEquals(20, response.achievementsTotal());
        assertEquals(25.0, response.achievementPercentage());
        assertEquals(CompletionStatus.IN_PROGRESS, response.completionStatus());

        String json = objectMapper.writeValueAsString(response);
        assertTrue(json.contains("\"estimatedClearMinutes\":360"));
        assertTrue(json.contains("\"achievementsUnlocked\":5"));
        assertTrue(json.contains("\"achievementsTotal\":20"));
        assertTrue(json.contains("\"achievementPercentage\":25.0"));
        assertTrue(json.contains("\"completionStatus\":\"IN_PROGRESS\""));

        SteamGameResponse deserialized = objectMapper.readValue(json, SteamGameResponse.class);
        assertEquals(response, deserialized);
    }

    @Test
    void testGameRecommendationDtoSerialization() throws Exception {
        GameRecommendationDto dto = new GameRecommendationDto(
                858710L,
                "Gravity Circuit",
                120,
                "6d05b74030eea68e4816c3c4ca565131c378d338",
                95,
                "Punchy retro platformer",
                40,
                480,
                15,
                30,
                50.0,
                CompletionStatus.IN_PROGRESS
        );

        String json = objectMapper.writeValueAsString(dto);
        assertTrue(json.contains("\"estimatedClearMinutes\":480"));
        assertTrue(json.contains("\"achievementsUnlocked\":15"));
        assertTrue(json.contains("\"completionStatus\":\"IN_PROGRESS\""));

        GameRecommendationDto deserialized = objectMapper.readValue(json, GameRecommendationDto.class);
        assertEquals(dto, deserialized);
    }
}
