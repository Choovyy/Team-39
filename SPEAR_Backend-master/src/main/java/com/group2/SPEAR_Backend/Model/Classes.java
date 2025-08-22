package com.group2.SPEAR_Backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "classes")
public class Classes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cid")
    private Long cid;

    @JsonIgnore
    @ManyToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "created_by", referencedColumnName = "uid")
    private User createdBy;

    @Column(name = "course_code")
    private String courseCode;

    @Column(name = "section")
    private String section;

    @Column(name = "school_year")
    private String schoolYear;

    @Column(name = "semester")
    private String semester;

    @Column(name = "course_description")
    private String courseDescription;

    @Column(name = "class_key", unique = true)
    private String classKey;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "max_members", nullable = false)
    private int maxTeamSize = 5;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "class_enrollments",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> enrolledStudents = new HashSet<>();

    @Column(name = "needs_advisory", nullable = false)
    private boolean needsAdvisory;

    //add list of advisers, many2many user and class
    //query join interest and user (teacher)


    public Classes() {}

    public Classes(User createdBy, String courseCode, String section, String schoolYear,
                   String semester, String classKey, String courseDescription, boolean isDeleted, int maxTeamSize,
                   Boolean needsAdvisory) {
        this.createdBy = createdBy;
        this.courseCode = courseCode;
        this.section = section;
        this.schoolYear = schoolYear;
        this.semester = semester;
        this.courseDescription = courseDescription;
        this.isDeleted = isDeleted;
        this.classKey = classKey;
        this.createdDate = LocalDate.now();
        this.maxTeamSize = maxTeamSize;
        this.needsAdvisory = needsAdvisory;
    }


    public Long getCid() {
        return cid;
    }

    public void setCid(Long cid) {
        this.cid = cid;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getSchoolYear() {
        return schoolYear;
    }

    public void setSchoolYear(String schoolYear) {
        this.schoolYear = schoolYear;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getCourseDescription() {
        return courseDescription;
    }

    public void setCourseDescription(String courseDescription) {
        this.courseDescription = courseDescription;
    }

    public boolean isDeleted() {
        return isDeleted != null ? isDeleted : false;
    }

    public void setDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public String getClassKey() {
        return classKey;
    }

    public void setClassKey(String classKey) {
        this.classKey = classKey;
    }

    public Set<User> getEnrolledStudents() {
        return enrolledStudents;
    }

    public void setEnrolledStudents(Set<User> enrolledStudents) {
        this.enrolledStudents = enrolledStudents;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public int getMaxTeamSize() {
        return maxTeamSize;
    }

    public void setMaxTeamSize(int maxTeamSize) {
        this.maxTeamSize = maxTeamSize;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean deleted) {
        isDeleted = deleted;
    }

    public boolean isNeedsAdvisory() {
        return needsAdvisory;
    }

    public void setNeedsAdvisory(boolean needsAdvisory) {
        this.needsAdvisory = needsAdvisory;
    }
}
