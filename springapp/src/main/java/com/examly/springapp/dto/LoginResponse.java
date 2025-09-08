

// LoginResponse.java
package com.examly.springapp.dto;

import com.examly.springapp.model.UserRole;

public class LoginResponse {
    private Long userId;
    private String username;
    private UserRole role;
    private String token; // Simple token for session management

    public LoginResponse() {}

    public LoginResponse(Long userId, String username, UserRole role, String token) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}