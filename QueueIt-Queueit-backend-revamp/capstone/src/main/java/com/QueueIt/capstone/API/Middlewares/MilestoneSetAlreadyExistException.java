package com.QueueIt.capstone.API.Middlewares;

public class MilestoneSetAlreadyExistException extends Exception{
    public MilestoneSetAlreadyExistException(String message) {
        super(message);
    }
}
