package com.QueueIt.capstone.API.Middlewares;

public class QueueingEntryNotFoundException extends Exception{
    public QueueingEntryNotFoundException(String message) {
        super(message);
    }
}
