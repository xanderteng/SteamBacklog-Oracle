package com.steambacklog.oracle.service;

import com.steambacklog.oracle.config.GeminiApiProperties;
import com.steambacklog.oracle.dto.gemini.GeminiCandidate;
import com.steambacklog.oracle.dto.gemini.GeminiContent;
import com.steambacklog.oracle.dto.gemini.GeminiGenerateRequest;
import com.steambacklog.oracle.dto.gemini.GeminiGenerateResponse;
import com.steambacklog.oracle.dto.gemini.GeminiPart;
import com.steambacklog.oracle.exception.GeminiApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeminiClientTest {

    @Mock
    private RestClient restClient;

    @Mock
    @SuppressWarnings("rawtypes")
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    @SuppressWarnings("rawtypes")
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private GeminiApiProperties properties;
    private GeminiClient geminiClient;

    @BeforeEach
    void setUp() {
        properties = new GeminiApiProperties("https://generativelanguage.googleapis.com", "test-gemini-key");
        geminiClient = new GeminiClient(restClient, properties);
    }

    @Test
    @SuppressWarnings("unchecked")
    void generateContent_Success() {
        String jsonPayload = "{\"playerPersonaSummary\":\"Casual Gamer\",\"recommendations\":[]}";
        GeminiPart part = new GeminiPart(jsonPayload);
        GeminiContent content = new GeminiContent(List.of(part), "model");
        GeminiCandidate candidate = new GeminiCandidate(content, "STOP", 0);
        GeminiGenerateResponse response = new GeminiGenerateResponse(List.of(candidate));

        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(any(Function.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(GeminiGenerateRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
        when(responseSpec.body(GeminiGenerateResponse.class)).thenReturn(response);

        String result = geminiClient.generateContent("Test prompt");

        assertNotNull(result);
        assertEquals(jsonPayload, result);
    }

    @Test
    @SuppressWarnings("unchecked")
    void generateContent_EmptyResponse_ThrowsGeminiApiException() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(any(Function.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any(GeminiGenerateRequest.class))).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
        when(responseSpec.body(GeminiGenerateResponse.class)).thenReturn(null);

        GeminiApiException ex = assertThrows(GeminiApiException.class, () ->
                geminiClient.generateContent("Test prompt")
        );

        assertTrue(ex.getMessage().contains("Empty or missing content"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void generateContent_NetworkError_ThrowsGeminiApiException() {
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(any(Function.class))).thenThrow(new RuntimeException("Connection timeout"));

        GeminiApiException ex = assertThrows(GeminiApiException.class, () ->
                geminiClient.generateContent("Test prompt")
        );

        assertTrue(ex.getMessage().contains("Failed to communicate with Gemini API"));
    }
}
