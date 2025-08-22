package com.group2.SPEAR_Backend.DTO;

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
