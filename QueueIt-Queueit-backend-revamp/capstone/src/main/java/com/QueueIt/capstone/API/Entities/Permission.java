package com.QueueIt.capstone.API.Entities;

public enum Permission {
    ADMIN_READ("admin:read"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_CREATE("admin:create"),
    ADMIN_DELETE("admin:delete"),
    STUDENT_READ("student:read"),
    STUDENT_UPDATE("student:update"),
    STUDENT_CREATE("student:create"),
    STUDENT_DELETE("student:delete"),
    ADVISER_READ("adviser:read"),
    ADVISER_UPDATE("adviser:update"),
    ADVISER_CREATE("adviser:create"),
    ADVISER_DELETE("adviser:delete"),
    ;

    private String permission;

    Permission(String s) {
    }

    public String getPermission() {
        return permission;
    }
}
