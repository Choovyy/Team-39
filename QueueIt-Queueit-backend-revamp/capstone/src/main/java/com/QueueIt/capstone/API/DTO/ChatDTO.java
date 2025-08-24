package com.QueueIt.capstone.API.DTO;

public class ChatDTO {
    private Long userID;
    private Long adviserID;
    private String message;
    private String firstname;
    private String lastname;

    public ChatDTO() {
    }

    public ChatDTO(Long userID, Long adviserID, String message, String firstname, String lastname) {
        this.userID = userID;
        this.adviserID = adviserID;
        this.message = message;
        this.firstname = firstname;
        this.lastname = lastname;
    }

    public Long getUserID() {
        return userID;
    }

    public Long getAdviserID() {
        return adviserID;
    }

    public String getMessage() {
        return message;
    }

    public String getFirstname() {
        return firstname;
    }

    public String getLastname() {
        return lastname;
    }
}
