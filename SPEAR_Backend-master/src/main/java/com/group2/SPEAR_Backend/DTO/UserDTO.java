package com.group2.SPEAR_Backend.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.group2.SPEAR_Backend.Model.User;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDTO {
    private int statusCode;
    private String error;
    private String message;
    private String token;
    private String refreshToken;
    private String expirationTime;
    private String firstname;
    private String lastname;
    private String role;
    private String email;
    private String password;
    private boolean isDeleted;
    private User user;
    private List<User> userList;
    private Integer uid;
    private String interests;
    private String department;

    // Constructor with role normalization
    public UserDTO(int statusCode, String message, String firstname, String lastname, String email, String role, Integer uid, String interests, String department) {
        this.statusCode = statusCode;
        this.message = message;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.role = (role != null) ? role.toUpperCase() : "N/A"; // Normalize role to uppercase
        this.uid = uid;
        this.interests = ("TEACHER".equalsIgnoreCase(this.role)) ? interests : "N/A";
        this.department = ("TEACHER".equalsIgnoreCase(this.role)) ? department : "N/A";
    }

    public UserDTO(int statusCode, String message, List<User> userList) {
        this.statusCode = statusCode;
        this.message = message;
        this.userList = userList;
    }

    public UserDTO(int statusCode, String message, String firstname, String lastname, String email, String role) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.role = (role != null) ? role.toUpperCase() : "N/A"; // Normalize role to uppercase
        this.interests = ("TEACHER".equalsIgnoreCase(this.role)) ? interests : "N/A";
        this.department = ("TEACHER".equalsIgnoreCase(this.role)) ? department : "N/A";
    }

    // Constructor for getting users in a class
    public UserDTO(int statusCode, String message, String firstname, String lastname, String role) {
        this.statusCode = statusCode;
        this.message = message;
        this.firstname = firstname;
        this.lastname = lastname;
        this.role = (role != null) ? role.toUpperCase() : "N/A"; // Normalize role to uppercase
        this.interests = ("TEACHER".equalsIgnoreCase(this.role)) ? interests : "N/A";
        this.department = ("TEACHER".equalsIgnoreCase(this.role)) ? department : "N/A";
    }

    public UserDTO(String firstname, String lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
    }

    //qualified adviser
    public UserDTO(Integer uid, String firstname, String lastname, String email, String role, String interests, String department) {
        this.uid = uid;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.role = (role != null) ? role.toUpperCase() : "N/A";
        this.interests = interests;
        this.department = department;
    }


    // Correct Constructor for Query
    public UserDTO(String firstname, String lastname, String email, String interests, String department) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.interests = interests;
        this.department = department;
    }



    //this bitch is for search
    public UserDTO(String firstname, String lastname, String email, Integer uid) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.uid = uid;
    }

    public UserDTO() {}

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getExpirationTime() {
        return expirationTime;
    }

    public void setExpirationTime(String expirationTime) {
        this.expirationTime = expirationTime;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = (role != null) ? role.toUpperCase() : "N/A";
        if (!"TEACHER".equalsIgnoreCase(this.role)) {
            this.interests = "N/A";
            this.department = "N/A";
        }
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<User> getUserList() {
        return userList;
    }

    public void setUserList(List<User> userList) {
        this.userList = userList;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public String getFirstname() {
        return firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public Integer getUid() {
        return uid;
    }

    public void setUid(Integer uid) {
        this.uid = uid;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        if ("TEACHER".equalsIgnoreCase(this.role)) {
            this.interests = interests;
        }
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        if ("TEACHER".equalsIgnoreCase(this.role)) {
            this.department = department;
        }
    }
}