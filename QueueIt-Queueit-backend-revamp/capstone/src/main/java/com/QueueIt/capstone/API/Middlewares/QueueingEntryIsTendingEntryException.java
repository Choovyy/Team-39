package com.QueueIt.capstone.API.Middlewares;

public class QueueingEntryIsTendingEntryException extends Exception{
    public QueueingEntryIsTendingEntryException(String message) {
        super(message);
    }
}
