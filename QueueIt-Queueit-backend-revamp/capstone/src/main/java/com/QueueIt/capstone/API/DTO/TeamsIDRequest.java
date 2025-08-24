package com.QueueIt.capstone.API.DTO;

import java.util.List;

public class TeamsIDRequest {
    List<Integer> teamsIDList;

    public TeamsIDRequest() {
    }

    public TeamsIDRequest(List<Integer> teamsIDList) {
        this.teamsIDList = teamsIDList;
    }

    public List<Integer> getTeamsIDList() {
        return teamsIDList;
    }

    public void setTeamsIDList(List<Integer> teamsIDList) {
        this.teamsIDList = teamsIDList;
    }
}
