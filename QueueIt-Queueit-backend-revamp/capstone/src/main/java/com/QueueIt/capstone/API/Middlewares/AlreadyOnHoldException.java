package com.QueueIt.capstone.API.Middlewares;

public class AlreadyOnHoldException extends Exception{
    public AlreadyOnHoldException(String message) {
        super(message);
    }
}
