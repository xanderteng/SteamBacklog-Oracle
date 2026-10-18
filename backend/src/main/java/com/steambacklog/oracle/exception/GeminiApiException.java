package com.steambacklog.oracle.exception;

public class GeminiApiException extends RuntimeException {

    private final int statusCode;

    public GeminiApiException(String message) {
        this(message, 502);
    }

    public GeminiApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public GeminiApiException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
