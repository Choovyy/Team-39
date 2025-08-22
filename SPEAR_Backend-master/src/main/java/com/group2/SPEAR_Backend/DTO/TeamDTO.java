package com.group2.SPEAR_Backend.DTO;

import com.group2.SPEAR_Backend.Model.DayOfWeek;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class TeamDTO {

    private int tid;
    private String groupName;
    private String projectName;
    private Integer projectId;
    private String leaderName;
    private Long classId;
    private List<Integer> memberIds;
    private List<String> memberNames;
    private boolean isRecruitmentOpen;
    private List<FeatureDTO> features;
    private String projectDescription;
    private Integer adviserId;
    private Integer scheduleId;
    private String adviserName;
    private String scheduleDay;
    private String scheduleTime;
    private int maxMembers;
    private String courseDescription;
    private Long teamId;




    private DayOfWeek scheduledDay; // by queueit
    private LocalTime start; // by queueit
    private LocalTime end; // by queueit


    public TeamDTO() {}

    public TeamDTO(int tid, String groupName, String projectName, Integer projectId, String leaderName, Long classId,
                   List<Integer> memberIds, boolean isRecruitmentOpen, List<FeatureDTO> features,
                   String projectDescription, Integer adviserId, Integer scheduleId) {
        this.tid = tid;
        this.groupName = groupName;
        this.projectName = (projectName != null) ? projectName : "No Project Assigned";
        this.projectId = projectId;
        this.leaderName = leaderName;
        this.classId = classId;
        this.memberIds = memberIds;
        this.isRecruitmentOpen = isRecruitmentOpen;
        this.features = features;
        this.projectDescription = (projectDescription != null) ? projectDescription : "No Description Available";
        this.adviserId = adviserId;
        this.scheduleId = scheduleId;
    }

    //getting teacher name and sched
    public TeamDTO(int tid, String groupName, String projectName, Integer projectId, String leaderName, Long classId,
                   List<Integer> memberIds, boolean isRecruitmentOpen, List<FeatureDTO> features,
                   String projectDescription, String adviserName, String scheduleDay, String scheduleTime,
                   List<String> memberNames, int adviserId) {
        this.tid = tid;
        this.groupName = groupName;
        this.projectName = (projectName != null) ? projectName : "No Project Assigned";
        this.projectId = projectId;
        this.leaderName = leaderName;
        this.classId = classId;
        this.memberIds = memberIds;
        this.memberNames = memberNames != null ? memberNames : new ArrayList<>();
        this.isRecruitmentOpen = isRecruitmentOpen;
        this.features = features;
        this.projectDescription = (projectDescription != null) ? projectDescription : "No Description Available";
        this.adviserName = (adviserName != null) ? adviserName : "No Adviser Assigned";
        this.scheduleDay = (scheduleDay != null) ? scheduleDay : "No Schedule Set";
        this.scheduleTime = (scheduleTime != null) ? scheduleTime : "No Schedule Set";
        this.adviserId = adviserId;
    }

    //fullname members
    public TeamDTO(int tid, String groupName, String projectName, Integer projectId, String leaderName, Long classId,
                   List<Integer> memberIds, boolean isRecruitmentOpen, List<FeatureDTO> features,
                   String projectDescription, Integer adviserId, Integer scheduleId, int maxMembers) {
        this.tid = tid;
        this.groupName = groupName;
        this.projectName = (projectName != null) ? projectName : "No Project Assigned";
        this.projectId = projectId;
        this.leaderName = leaderName;
        this.classId = classId;
        this.memberIds = memberIds;
        this.isRecruitmentOpen = isRecruitmentOpen;
        this.features = features;
        this.projectDescription = (projectDescription != null) ? projectDescription : "No Description Available";
        this.adviserId = adviserId;
        this.scheduleId = scheduleId;
        this.maxMembers = maxMembers;
    }

    public TeamDTO(int tid, String groupName, String projectName, Integer projectId, String leaderName, Long classId,
                   List<Integer> memberIds, boolean isRecruitmentOpen, List<FeatureDTO> features,
                   String projectDescription, Integer adviserId, Integer scheduleId,
                   List<String> memberNames, String adviserName, String scheduleDay, String scheduleTime) {

        this.tid = tid;
        this.groupName = groupName;
        this.projectName = (projectName != null) ? projectName : "No Project Assigned";
        this.projectId = projectId;
        this.leaderName = leaderName;
        this.classId = classId;
        this.memberIds = (memberIds != null) ? memberIds : new ArrayList<>();
        this.memberNames = (memberNames != null) ? memberNames : new ArrayList<>();
        this.isRecruitmentOpen = isRecruitmentOpen;
        this.features = (features != null) ? features : new ArrayList<>();
        this.projectDescription = (projectDescription != null) ? projectDescription : "No Description Available";
        this.adviserId = adviserId;
        this.scheduleId = scheduleId;
        this.adviserName = (adviserName != null) ? adviserName : "No Adviser Assigned";
        this.scheduleDay = (scheduleDay != null) ? scheduleDay : "No Schedule Set";
        this.scheduleTime = (scheduleTime != null) ? scheduleTime : "No Schedule Set";

    }

    //for advisory (last na ni pramis)
    public TeamDTO(int tid, String groupName, String projectName, Integer projectId, String leaderName, Long classId,
                   List<Integer> memberIds, boolean isRecruitmentOpen, List<FeatureDTO> features,
                   String projectDescription, String adviserName, String scheduleDay, String scheduleTime,
                   String courseDescription, List<String> memberNames) {

        this.tid = tid;
        this.groupName = groupName;
        this.projectName = (projectName != null) ? projectName : "No Project Assigned";
        this.projectId = projectId;
        this.leaderName = leaderName;
        this.classId = classId;
        this.memberIds = (memberIds != null) ? memberIds : new ArrayList<>();
        this.memberNames = (memberNames != null) ? memberNames : new ArrayList<>();
        this.isRecruitmentOpen = isRecruitmentOpen;
        this.features = (features != null) ? features : new ArrayList<>();
        this.projectDescription = (projectDescription != null) ? projectDescription : "No Description Available";
        this.adviserName = (adviserName != null) ? adviserName : "No Adviser Assigned";
        this.scheduleDay = (scheduleDay != null) ? scheduleDay : "No Schedule Set";
        this.scheduleTime = (scheduleTime != null) ? scheduleTime : "No Schedule Set";
        this.courseDescription = (courseDescription != null) ? courseDescription : "No Class Info Available";
    }

    public TeamDTO(Long teamId, String groupName, Long classId, List<Integer> memberIds, List<String> memberNames) {
        this.teamId = teamId;
        this.groupName = groupName;
        this.memberIds = memberIds;
        this.classId = classId;
        this.memberNames = memberNames;
    }

    public TeamDTO(int tid, String groupName, Long classId, List<Integer> memberIds, List<String> memberNames,
                   Integer adviserId, String adviserName, String courseDescription,
                   DayOfWeek scheduledDay, LocalTime start, LocalTime end) {

        this.tid = tid;
        this.groupName = groupName;
        this.classId = classId;
        this.memberIds = memberIds;
        this.memberNames = memberNames;
        this.adviserId = adviserId;
        this.adviserName = adviserName;
        this.courseDescription = courseDescription;
        this.scheduledDay = scheduledDay;  // DayOfWeek
        this.start = start;  // LocalTime
        this.end = end;  // LocalTime
    }








    public int getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(int maxMembers) {
        this.maxMembers = maxMembers;
    }

    //created for queueit
    public TeamDTO(int tid, String groupName, Long classId, List<Integer> memberIds, List<String> memberNames, DayOfWeek scheduledDay, LocalTime start, LocalTime end) {
        this.tid = tid;
        this.groupName = groupName;
        this.classId = classId;
        this.memberIds = memberIds;
        this.memberNames = memberNames;
        this.scheduledDay = scheduledDay;
        this.start = start;
        this.end = end;
    }

    public TeamDTO(int tid, String groupName, Long cid, List<Integer> list, List<String> memberNames, DayOfWeek day, LocalTime startTime, LocalTime endTime, int uid) {
        this.tid = tid;
        this.groupName = groupName;
        this.classId = cid;
        this.memberIds = list;
        this.memberNames = memberNames;
        this.scheduledDay = day;
        this.start = startTime;
        this.end = endTime;
        this.adviserId = uid;
    }

    public TeamDTO(int tid, String groupName, Long cid, List<Integer> list, List<String> memberNames, DayOfWeek day, LocalTime startTime, LocalTime endTime, int uid, String adviserName) {
        this.tid = tid;
        this.groupName = groupName;
        this.classId = cid;
        this.memberIds = list;
        this.memberNames = memberNames;
        this.scheduledDay = day;
        this.start = startTime;
        this.end = endTime;
        this.adviserId = uid;
        this.adviserName = adviserName;
    }




    public int getTid() {
        return tid;
    }

    public void setTid(int tid) {
        this.tid = tid;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public Integer getProjectId() {
        return projectId;
    }

    public void setProjectId(Integer projectId) {
        this.projectId = projectId;
    }

    public String getLeaderName() {
        return leaderName;
    }

    public void setLeaderName(String leaderName) {
        this.leaderName = leaderName;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public List<Integer> getMemberIds() {
        return memberIds;
    }

    public void setMemberIds(List<Integer> memberIds) {
        this.memberIds = memberIds;
    }

    public boolean isRecruitmentOpen() {
        return isRecruitmentOpen;
    }

    public void setRecruitmentOpen(boolean recruitmentOpen) {
        isRecruitmentOpen = recruitmentOpen;
    }

    public List<FeatureDTO> getFeatures() {
        return features;
    }

    public void setFeatures(List<FeatureDTO> features) {
        this.features = features;
    }

    public String getProjectDescription() {
        return projectDescription;
    }

    public void setProjectDescription(String projectDescription) {
        this.projectDescription = (projectDescription != null) ? projectDescription : "No Description Available";
    }

    public Integer getAdviserId() {
        return adviserId;
    }

    public void setAdviserId(Integer adviserId) {
        this.adviserId = adviserId;
    }

    public Integer getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Integer scheduleId) {
        this.scheduleId = scheduleId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public List<String> getMemberNames() {
        return memberNames;
    }

    public void setMemberNames(List<String> memberNames) {
        this.memberNames = memberNames;
    }

    public String getAdviserName() {
        return adviserName;
    }

    public void setAdviserName(String adviserName) {
        this.adviserName = adviserName;
    }

    public String getScheduleDay() {
        return scheduleDay;
    }

    public void setScheduleDay(String scheduleDay) {
        this.scheduleDay = scheduleDay;
    }

    public String getScheduleTime() {
        return scheduleTime;
    }

    public void setScheduleTime(String scheduleTime) {
        this.scheduleTime = scheduleTime;
    }

    public DayOfWeek getScheduledDay() {
        return scheduledDay;
    }

    public void setScheduledDay(DayOfWeek scheduledDay) {
        this.scheduledDay = scheduledDay;
    }

    public LocalTime getStart() {
        return start;
    }

    public void setStart(LocalTime start) {
        this.start = start;
    }

    public LocalTime getEnd() {
        return end;
    }

    public void setEnd(LocalTime end) {
        this.end = end;
    }

    public String getCourseDescription() {
        return courseDescription;
    }

    public void setCourseDescription(String courseDescription) {
        this.courseDescription = courseDescription;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
}