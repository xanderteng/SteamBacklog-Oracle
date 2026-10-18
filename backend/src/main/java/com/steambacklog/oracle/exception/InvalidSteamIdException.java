package com.steambacklog.oracle.exception;

public class InvalidSteamIdException extends RuntimeException {

    public InvalidSteamIdException(String message) {
        super(message);
    }
}
