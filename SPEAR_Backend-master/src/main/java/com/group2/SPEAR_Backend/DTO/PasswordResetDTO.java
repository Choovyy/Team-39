package com.group2.SPEAR_Backend.DTO;

public record PasswordResetDTO(String email, String token, String newPassword) { }