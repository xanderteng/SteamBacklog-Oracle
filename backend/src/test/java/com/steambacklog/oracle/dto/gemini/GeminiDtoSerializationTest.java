package com.steambacklog.oracle.dto.gemini;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeminiDtoSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void testSerializeGenerateRequest() throws Exception {
        GeminiGenerateRequest request = GeminiGenerateRequest.of("Recommend a game", "application/json");

        String json = objectMapper.writeValueAsString(request);
        assertTrue(json.contains("\"contents\""));
        assertTrue(json.contains("\"Recommend a game\""));
        assertTrue(json.contains("\"responseMimeType\":\"application/json\""));
    }

    @Test
    void testDeserializeGenerateResponse() throws Exception {
        String json = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "{\\"playerPersonaSummary\\":\\"RPG fan\\",\\"recommendations\\":[]}"
                          }
                        ],
                        "role": "model"
                      },
                      "finishReason": "STOP",
                      "index": 0
                    }
                  ]
                }
                """;

        GeminiGenerateResponse response = objectMapper.readValue(json, GeminiGenerateResponse.class);

        assertNotNull(response);
        assertNotNull(response.candidates());
        assertEquals(1, response.candidates().size());
        assertEquals("STOP", response.candidates().get(0).finishReason());
        assertEquals("{\"playerPersonaSummary\":\"RPG fan\",\"recommendations\":[]}", response.getFirstText());
    }

    @Test
    void testGetFirstTextWithEmptyCandidates() {
        GeminiGenerateResponse empty = new GeminiGenerateResponse(null);
        assertNull(empty.getFirstText());
    }
}
