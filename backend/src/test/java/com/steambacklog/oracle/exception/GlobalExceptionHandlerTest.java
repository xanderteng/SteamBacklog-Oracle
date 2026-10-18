package com.steambacklog.oracle.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void testHandleInvalidSteamId() {
        InvalidSteamIdException ex = new InvalidSteamIdException("Invalid ID provided");
        ProblemDetail problem = handler.handleInvalidSteamId(ex);

        assertEquals(HttpStatus.BAD_REQUEST.value(), problem.getStatus());
        assertEquals("Invalid Steam ID", problem.getTitle());
        assertEquals("Invalid ID provided", problem.getDetail());
    }

    @Test
    void testHandleSteamApiException() {
        SteamApiException ex = new SteamApiException("Steam upstream error", 502);
        ProblemDetail problem = handler.handleSteamApiException(ex);

        assertEquals(HttpStatus.BAD_GATEWAY.value(), problem.getStatus());
        assertEquals("Steam API Error", problem.getTitle());
        assertEquals("Steam upstream error", problem.getDetail());
    }

    @Test
    void testHandleGenericException() {
        RuntimeException ex = new RuntimeException("Unexpected error");
        ProblemDetail problem = handler.handleGenericException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), problem.getStatus());
        assertEquals("Internal Server Error", problem.getTitle());
    }
}
