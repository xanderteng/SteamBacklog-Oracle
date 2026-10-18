package com.steambacklog.oracle.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GeminiApiPropertiesTest {

    @Test
    void testGeminiApiProperties() {
        GeminiApiProperties properties = new GeminiApiProperties();
        assertEquals("https://generativelanguage.googleapis.com", properties.getBaseUrl());
        assertEquals("dummy-dev-key", properties.getKey());

        properties.setBaseUrl("https://custom.api.url");
        properties.setKey("custom-key");

        assertEquals("https://custom.api.url", properties.getBaseUrl());
        assertEquals("custom-key", properties.getKey());
    }
}
