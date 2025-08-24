package com.QueueIt.capstone.API.Middlewares;

public class QueueingManagerInactiveException extends Exception{
    public QueueingManagerInactiveException(String message){
        super(message);
    }
}
