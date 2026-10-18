package com.steambacklog.oracle.exception;

public class EmptyBacklogException extends RuntimeException {

    public EmptyBacklogException(String message) {
        super(message);
    }
}
