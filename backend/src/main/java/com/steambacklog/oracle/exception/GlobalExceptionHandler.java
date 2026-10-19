package com.steambacklog.oracle.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(InvalidSteamIdException.class)
    public ProblemDetail handleInvalidSteamId(InvalidSteamIdException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Invalid Steam ID");
        problem.setType(URI.create("https://steambacklog.oracle/errors/invalid-steam-id"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(EmptyBacklogException.class)
    public ProblemDetail handleEmptyBacklog(EmptyBacklogException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Empty Backlog");
        problem.setType(URI.create("https://steambacklog.oracle/errors/empty-backlog"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(SteamApiException.class)
    public ProblemDetail handleSteamApiException(SteamApiException ex) {
        HttpStatus status;
        try {
            status = HttpStatus.valueOf(ex.getStatusCode());
        } catch (IllegalArgumentException ignored) {
            status = HttpStatus.BAD_GATEWAY;
        }

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, ex.getMessage());
        problem.setTitle("Steam API Error");
        problem.setType(URI.create("https://steambacklog.oracle/errors/steam-api-error"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(GeminiApiException.class)
    public ProblemDetail handleGeminiApiException(GeminiApiException ex) {
        HttpStatus status;
        try {
            status = HttpStatus.valueOf(ex.getStatusCode());
        } catch (IllegalArgumentException ignored) {
            status = HttpStatus.BAD_GATEWAY;
        }

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, ex.getMessage());
        problem.setTitle("Gemini API Error");
        problem.setType(URI.create("https://steambacklog.oracle/errors/gemini-api-error"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        if (detail.isBlank()) {
            detail = "Validation failed for request arguments";
        }

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
        problem.setTitle("Validation Failed");
        problem.setType(URI.create("https://steambacklog.oracle/errors/validation-failed"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        log.error("Unhandled exception caught by GlobalExceptionHandler: ", ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal error occurred"
        );
        problem.setTitle("Internal Server Error");
        problem.setType(URI.create("https://steambacklog.oracle/errors/internal-error"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
