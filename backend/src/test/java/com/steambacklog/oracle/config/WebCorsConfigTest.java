package com.steambacklog.oracle.config;

import com.steambacklog.oracle.controller.SteamSyncController;
import com.steambacklog.oracle.exception.GlobalExceptionHandler;
import com.steambacklog.oracle.service.SteamSyncService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SteamSyncController.class)
@Import({WebCorsConfig.class, GlobalExceptionHandler.class})
class WebCorsConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SteamSyncService steamSyncService;

    @Test
    @DisplayName("Should allow preflight CORS OPTIONS requests from http://localhost:5173 for /api/v1/**")
    void corsPreflight_allowedOrigin_returnsCorsHeaders() throws Exception {
        mockMvc.perform(options("/api/v1/steam/backlog/76561198000000000")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString("POST")));
    }

    @Test
    @DisplayName("Should reject or not include allow-origin header for disallowed origins")
    void corsPreflight_disallowedOrigin_doesNotAllowOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/steam/backlog/76561198000000000")
                        .header(HttpHeaders.ORIGIN, "http://untrusted-site.com")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isForbidden());
    }
}
