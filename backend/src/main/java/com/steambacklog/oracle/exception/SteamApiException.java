package com.steambacklog.oracle.exception;

public class SteamApiException extends RuntimeException {

    private final int statusCode;

    public SteamApiException(String message) {
        this(message, 502);
    }

    public SteamApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public SteamApiException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
