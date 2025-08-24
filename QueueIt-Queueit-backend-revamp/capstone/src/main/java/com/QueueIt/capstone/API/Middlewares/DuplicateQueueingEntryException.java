package com.QueueIt.capstone.API.Middlewares;

public class DuplicateQueueingEntryException extends Exception{
    public DuplicateQueueingEntryException(String message){
        super(message);
    }
}
