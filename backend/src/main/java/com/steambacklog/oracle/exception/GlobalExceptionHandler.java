package com.steambacklog.oracle.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(InvalidSteamIdException.class)
    public ProblemDetail handleInvalidSteamId(InvalidSteamIdException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Invalid Steam ID");
        problem.setType(URI.create("https://steambacklog.oracle/errors/invalid-steam-id"));
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

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
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
