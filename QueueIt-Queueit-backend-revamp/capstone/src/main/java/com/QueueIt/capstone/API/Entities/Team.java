package com.QueueIt.capstone.API.Entities;

import com.QueueIt.capstone.API.Enums.DayOfWeek;

import java.time.LocalTime;
import java.util.List;

public class Team {
    private Long tid;
    private String groupName;
    private List<Long> memberIds;
    private List<String> memberNames;
    private DayOfWeek scheduledDay;
    private LocalTime start;
    private LocalTime end;
    private Long adviserId;
    private Long classId;
    private String adviserName;


    public Team() {
    }

    public Team(Long tid, String groupName, List<Long> memberIds, List<String> memberNames, DayOfWeek scheduledDay, LocalTime start, LocalTime end, Long adviserId, Long classId, String adviserName) {
        this.tid = tid;
        this.groupName = groupName;
        this.memberIds = memberIds;
        this.memberNames = memberNames;
        this.scheduledDay = scheduledDay;
        this.start = start;
        this.end = end;
        this.adviserId = adviserId;
        this.classId = classId;
        this.adviserName = adviserName;
    }

    public Long getClassId() {
        return classId;
    }

    public Long getTid() {
        return tid;
    }

    public String getGroupName() {
        return groupName;
    }

    public List<Long> getMemberIds() {
        return memberIds;
    }

    public List<String> getMemberNames() {
        return memberNames;
    }

    public DayOfWeek getScheduledDay() {
        return scheduledDay;
    }

    public LocalTime getStart() {
        return start;
    }

    public LocalTime getEnd() {
        return end;
    }

    public Long getAdviserId() {
        return adviserId;
    }

    public String getAdviserName() {
        return adviserName;
    }

    @Override
    public String toString() {
        return "group name: "+this.groupName+" classroom id: "+this.classId+" advised by: "+this.adviserName;
    }
}
