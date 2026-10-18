package com.steambacklog.oracle.dto.steam;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SteamDtoSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testDeserializeSteamOwnedGamesResponse() throws Exception {
        String json = """
                {
                  "response": {
                    "game_count": 2,
                    "games": [
                      {
                        "appid": 220,
                        "name": "Half-Life 2",
                        "playtime_forever": 150,
                        "img_icon_url": "hash1"
                      },
                      {
                        "appid": 400,
                        "name": "Portal",
                        "playtime_forever": 45,
                        "img_icon_url": "hash2"
                      }
                    ]
                  }
                }
                """;

        SteamOwnedGamesResponse response = objectMapper.readValue(json, SteamOwnedGamesResponse.class);

        assertNotNull(response);
        assertNotNull(response.response());
        assertEquals(2, response.response().gameCount());
        assertEquals(2, response.response().games().size());

        SteamGameDto game1 = response.response().games().get(0);
        assertEquals(220L, game1.appid());
        assertEquals("Half-Life 2", game1.name());
        assertEquals(150, game1.playtimeForever());
        assertEquals("hash1", game1.imgIconUrl());

        SteamGameDto game2 = response.response().games().get(1);
        assertEquals(400L, game2.appid());
        assertEquals("Portal", game2.name());
        assertEquals(45, game2.playtimeForever());
        assertEquals("hash2", game2.imgIconUrl());
    }

    @Test
    void testDeserializeEmptyGamesResponse() throws Exception {
        String json = """
                {
                  "response": {
                    "game_count": 0
                  }
                }
                """;

        SteamOwnedGamesResponse response = objectMapper.readValue(json, SteamOwnedGamesResponse.class);

        assertNotNull(response);
        assertNotNull(response.response());
        assertEquals(0, response.response().gameCount());
        assertNotNull(response.response().games());
        assertTrue(response.response().games().isEmpty());
    }
}
