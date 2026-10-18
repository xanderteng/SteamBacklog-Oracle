package com.steambacklog.oracle.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class RestClientConfigTest {

    @Test
    void testSteamRestClientCreation() {
        SteamApiProperties properties = new SteamApiProperties();
        properties.setBaseUrl("https://api.steampowered.com");
        properties.setKey("test-key");

        RestClientConfig config = new RestClientConfig();
        RestClient restClient = config.steamRestClient(properties);

        assertNotNull(restClient);
    }

    @Test
    void testGeminiRestClientCreation() {
        GeminiApiProperties properties = new GeminiApiProperties();
        properties.setBaseUrl("https://generativelanguage.googleapis.com");
        properties.setKey("test-gemini-key");

        RestClientConfig config = new RestClientConfig();
        RestClient restClient = config.geminiRestClient(properties);

        assertNotNull(restClient);
    }
}
