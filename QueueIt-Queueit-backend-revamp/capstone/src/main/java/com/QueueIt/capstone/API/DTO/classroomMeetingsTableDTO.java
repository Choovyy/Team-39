package com.QueueIt.capstone.API.DTO;

public class classroomMeetingsTableDTO {
    private String groupName;
    private String facultyName;
    private Long numGradedMeetings;
    private Long numUngradedMeetings;
    private Long numFailedMeetings;

    public classroomMeetingsTableDTO() {
    }

    public classroomMeetingsTableDTO(String groupName, String facultyName, Long numGradedMeetings, Long numUngradedMeetings, Long numFailedMeetings) {
        this.groupName = groupName;
        this.facultyName = facultyName;
        this.numGradedMeetings = numGradedMeetings;
        this.numUngradedMeetings = numUngradedMeetings;
        this.numFailedMeetings = numFailedMeetings;
    }

    public Long getNumGradedMeetings() {
        return numGradedMeetings;
    }

    public void setNumGradedMeetings(Long numGradedMeetings) {
        this.numGradedMeetings = numGradedMeetings;
    }

    public Long getNumUngradedMeetings() {
        return numUngradedMeetings;
    }

    public void setNumUngradedMeetings(Long numUngradedMeetings) {
        this.numUngradedMeetings = numUngradedMeetings;
    }

    public Long getNumFailedMeetings() {
        return numFailedMeetings;
    }

    public void setNumFailedMeetings(Long numFailedMeetings) {
        this.numFailedMeetings = numFailedMeetings;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }


}
