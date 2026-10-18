package com.steambacklog.oracle.service;

import com.steambacklog.oracle.config.SteamApiProperties;
import com.steambacklog.oracle.dto.steam.SteamGameDto;
import com.steambacklog.oracle.dto.steam.SteamOwnedGamesResponse;
import com.steambacklog.oracle.dto.steam.SteamResponseContainer;
import com.steambacklog.oracle.exception.SteamApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.net.URI;
import java.util.List;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SteamApiClientTest {

    @Mock
    private RestClient restClient;

    @Mock
    @SuppressWarnings("rawtypes")
    private RestClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    private SteamApiProperties properties;
    private SteamApiClient steamApiClient;

    @BeforeEach
    void setUp() {
        properties = new SteamApiProperties("https://api.steampowered.com", "test-api-key");
        steamApiClient = new SteamApiClient(restClient, properties);
    }

    @Test
    @SuppressWarnings("unchecked")
    void getOwnedGames_Success() {
        SteamGameDto game = new SteamGameDto(220L, "Half-Life 2", 150, "hash123");
        SteamResponseContainer container = new SteamResponseContainer(1, List.of(game));
        SteamOwnedGamesResponse expectedResponse = new SteamOwnedGamesResponse(container);

        when(restClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
        when(responseSpec.body(SteamOwnedGamesResponse.class)).thenReturn(expectedResponse);

        SteamOwnedGamesResponse actual = steamApiClient.getOwnedGames("76561198000000000");

        assertNotNull(actual);
        assertNotNull(actual.response());
        assertEquals(1, actual.response().gameCount());
        assertEquals(1, actual.response().games().size());
        assertEquals("Half-Life 2", actual.response().games().get(0).name());
    }

    @Test
    @SuppressWarnings("unchecked")
    void getOwnedGames_EmptyResponse_ThrowsSteamApiException() {
        when(restClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
        when(responseSpec.body(SteamOwnedGamesResponse.class)).thenReturn(null);

        SteamApiException exception = assertThrows(SteamApiException.class, () ->
                steamApiClient.getOwnedGames("76561198000000000")
        );

        assertTrue(exception.getMessage().contains("Empty response"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void getOwnedGames_NetworkError_ThrowsSteamApiException() {
        when(restClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(Function.class))).thenThrow(new RuntimeException("Connection timed out"));

        SteamApiException exception = assertThrows(SteamApiException.class, () ->
                steamApiClient.getOwnedGames("76561198000000000")
        );

        assertTrue(exception.getMessage().contains("Failed to communicate with Steam API"));
    }
}
