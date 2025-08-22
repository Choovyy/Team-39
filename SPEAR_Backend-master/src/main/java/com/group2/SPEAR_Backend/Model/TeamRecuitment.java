package com.group2.SPEAR_Backend.Model;
import jakarta.persistence.*;

@Entity
@Table(name = "team_recuitment")
public class TeamRecuitment {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int trid;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "team_id", referencedColumnName = "tid")
    private Team team;

    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "student_id", referencedColumnName = "uid")
    private User student;

    @Column(name = "role")
    private String role;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED,
        EXPIRED
    }

   public TeamRecuitment(){

   }

   public TeamRecuitment(Team team, User student, String role, String reason, Status status) {
        this.team = team;
        this.student = student;
        this.role = role;
        this.reason = reason;
        this.status = status;
    }
    //when applying
    public TeamRecuitment(Team team, User student, String role) {
        this.team = team;
        this.student = student;
        this.role = role;
        this.status = Status.PENDING;
    }

    //status check
    public TeamRecuitment(Status status) {
        this.status = status;
    }


    public int getTrid() {
        return trid;
    }

    public void setTrid(int trid) {
        this.trid = trid;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
