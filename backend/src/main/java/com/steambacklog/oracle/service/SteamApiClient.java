package com.steambacklog.oracle.service;

import com.steambacklog.oracle.config.SteamApiProperties;
import com.steambacklog.oracle.dto.steam.SteamOwnedGamesResponse;
import com.steambacklog.oracle.exception.SteamApiException;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class SteamApiClient {

    private final RestClient restClient;
    private final SteamApiProperties properties;

    public SteamApiClient(@org.springframework.beans.factory.annotation.Qualifier("steamRestClient") RestClient steamRestClient, SteamApiProperties properties) {
        this.restClient = steamRestClient;
        this.properties = properties;
    }

    public SteamOwnedGamesResponse getOwnedGames(String steamId) {
        try {
            SteamOwnedGamesResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/IPlayerService/GetOwnedGames/v0001/")
                            .queryParam("key", properties.getKey())
                            .queryParam("steamid", steamId)
                            .queryParam("include_appinfo", 1)
                            .queryParam("include_played_free_games", 1)
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, clientResponse) -> {
                        throw new SteamApiException(
                                "Steam API returned error: " + clientResponse.getStatusCode(),
                                clientResponse.getStatusCode().value()
                        );
                    })
                    .body(SteamOwnedGamesResponse.class);

            if (response == null || response.response() == null) {
                throw new SteamApiException("Empty response received from Steam API", 502);
            }

            return response;
        } catch (SteamApiException e) {
            throw e;
        } catch (Exception e) {
            throw new SteamApiException("Failed to communicate with Steam API: " + e.getMessage(), 502, e);
        }
    }
}
