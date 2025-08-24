package com.QueueIt.capstone.API.Middlewares;

public class QueueingCapacityExceeded extends Exception{
    public QueueingCapacityExceeded(String message) {
        super(message);
    }
}
