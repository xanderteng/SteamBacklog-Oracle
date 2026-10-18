package com.steambacklog.oracle.exception;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
    void testHandleEmptyBacklog() {
        EmptyBacklogException ex = new EmptyBacklogException("No backlog games found for Steam ID: 76561198000000001");
        ProblemDetail problem = handler.handleEmptyBacklog(ex);

        assertEquals(HttpStatus.NOT_FOUND.value(), problem.getStatus());
        assertEquals("Empty Backlog", problem.getTitle());
        assertEquals("No backlog games found for Steam ID: 76561198000000001", problem.getDetail());
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
    void testHandleGeminiApiException() {
        GeminiApiException ex = new GeminiApiException("Gemini quota exceeded", 502);
        ProblemDetail problem = handler.handleGeminiApiException(ex);

        assertEquals(HttpStatus.BAD_GATEWAY.value(), problem.getStatus());
        assertEquals("Gemini API Error", problem.getTitle());
        assertEquals("Gemini quota exceeded", problem.getDetail());
    }

    @Test
    void testHandleMethodArgumentNotValid() throws Exception {
        Method method = getClass().getDeclaredMethod("dummyMethod", String.class);
        MethodParameter parameter = new MethodParameter(method, 0);

        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
        bindingResult.addError(new FieldError("target", "mood", "Mood cannot be blank"));
        bindingResult.addError(new FieldError("target", "availableMinutes", "Available minutes must be at least 5"));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);
        ProblemDetail problem = handler.handleMethodArgumentNotValid(ex);

        assertEquals(HttpStatus.BAD_REQUEST.value(), problem.getStatus());
        assertEquals("Validation Failed", problem.getTitle());
        assertTrue(problem.getDetail().contains("Mood cannot be blank"));
        assertTrue(problem.getDetail().contains("Available minutes must be at least 5"));
    }

    @Test
    void testHandleGenericException() {
        RuntimeException ex = new RuntimeException("Unexpected error");
        ProblemDetail problem = handler.handleGenericException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), problem.getStatus());
        assertEquals("Internal Server Error", problem.getTitle());
    }

    @SuppressWarnings("unused")
    private void dummyMethod(String param) {
    }
}
