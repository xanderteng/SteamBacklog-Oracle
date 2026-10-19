package com.steambacklog.oracle.service;

import com.steambacklog.oracle.config.GeminiApiProperties;
import com.steambacklog.oracle.dto.gemini.GeminiGenerateRequest;
import com.steambacklog.oracle.dto.gemini.GeminiGenerateResponse;
import com.steambacklog.oracle.exception.GeminiApiException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GeminiClient {

    private static final String MODEL_ENDPOINT = "/v1beta/models/gemini-3.5-flash-lite:generateContent";

    private final RestClient restClient;
    private final GeminiApiProperties properties;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Autowired
    public GeminiClient(@Qualifier("geminiRestClient") RestClient geminiRestClient,
                        GeminiApiProperties properties,
                        com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.restClient = geminiRestClient;
        this.properties = properties;
        this.objectMapper = objectMapper != null ? objectMapper : new com.fasterxml.jackson.databind.ObjectMapper();
    }

    public GeminiClient(RestClient geminiRestClient, GeminiApiProperties properties) {
        this(geminiRestClient, properties, new com.fasterxml.jackson.databind.ObjectMapper());
    }

    public String generateContent(String prompt) {
        try {
            GeminiGenerateRequest request = GeminiGenerateRequest.of(prompt, "application/json");

            byte[] responseBytes = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path(MODEL_ENDPOINT)
                            .queryParam("key", properties.getKey())
                            .build())
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .accept(org.springframework.http.MediaType.ALL)
                    .body(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, resp) -> {
                        throw new GeminiApiException(
                                "Gemini API returned error: " + resp.getStatusCode(),
                                resp.getStatusCode().value()
                        );
                    })
                    .body(byte[].class);

            if (responseBytes == null || responseBytes.length == 0) {
                throw new GeminiApiException("Empty or missing content in Gemini response", 502);
            }

            String rawJson = new String(responseBytes, java.nio.charset.StandardCharsets.UTF_8);
            GeminiGenerateResponse response = objectMapper.readValue(rawJson, GeminiGenerateResponse.class);

            if (response == null || response.getFirstText() == null) {
                throw new GeminiApiException("Empty or missing content in Gemini response", 502);
            }

            return response.getFirstText();
        } catch (GeminiApiException e) {
            throw e;
        } catch (Exception e) {
            throw new GeminiApiException("Failed to communicate with Gemini API: " + e.getMessage(), 502, e);
        }
    }
}
