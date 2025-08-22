package com.group2.SPEAR_Backend.DTO;

public class MemberSubmissionDTO {
    private int memberId;
    private String memberName;
    private Integer evaluatorId; // will be non-null for submitted members

    public MemberSubmissionDTO(int memberId, String memberName, Integer evaluatorId) {
        this.memberId = memberId;
        this.memberName = memberName;
        this.evaluatorId = evaluatorId;
    }

    public int getMemberId() {
        return memberId;
    }

    public String getMemberName() {
        return memberName;
    }

    public Integer getEvaluatorId() {
        return evaluatorId;
    }
}
