package com.group2.SPEAR_Backend.Model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name="users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private int uid;

    @Column(name="firstname")
    private String firstname;

    @Column(name="lastname")
    private String lastname;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name="password")
    private String password;

    @Column(name = "role", nullable = false)
    private String role = "TEACHER";


    private String interests;

    private String department;

    private Boolean isDeleted = false;

    @ManyToMany(mappedBy = "enrolledStudents", cascade = CascadeType.MERGE)
    private Set<Classes> enrolledClasses = new HashSet<>();

    public User(int uid, String firstname, String lastname, String email, String password, String role, Boolean isDeleted, String interests, String department) {
        this.uid = uid;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.role = role.toUpperCase();
        this.isDeleted = isDeleted;
        this.interests = this.role.equals("TEACHER") ? interests : "N/A";
        this.department = this.role.equals("TEACHER") ? department : "N/A";
    }

    public User(String firstname, String lastname, String email, String password, String role, Boolean isDeleted, String interests, String department) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.role = role.toUpperCase();
        this.isDeleted = isDeleted;
        this.interests = this.role.equals("TEACHER") ? interests : "N/A";
        this.department = this.role.equals("TEACHER") ? department : "N/A";
    }

    public User() {}

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public int getUid() {
        return uid;
    }

    public void setUid(int uid) {
        this.uid = uid;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            this.role = "TEACHER";
        } else {
            this.role = role.toUpperCase();
        }
    }


    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Set<Classes> getEnrolledClasses() {
        return enrolledClasses;
    }

    public void setEnrolledClasses(Set<Classes> enrolledClasses) {
        this.enrolledClasses = enrolledClasses;
    }

    public Boolean getIsDeleted() {
        return isDeleted != null ? isDeleted : false;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        if ("TEACHER".equalsIgnoreCase(this.role)) {
            this.interests = (interests != null && !interests.trim().isEmpty()) ? interests : "N/A";
        } else {
            this.interests = "N/A";
        }
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        if ("TEACHER".equalsIgnoreCase(this.role)) {
            this.department = (department != null && !department.trim().isEmpty()) ? department : "N/A";
        } else {
            this.department = "N/A";
        }
    }
}
