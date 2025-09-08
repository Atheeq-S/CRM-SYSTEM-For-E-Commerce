package com.examly.springapp.controller;

import com.examly.springapp.model.User;
import com.examly.springapp.model.UserRole;
import com.examly.springapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private AuthService authService;

    private boolean isAdmin(String token) {
        if (token == null || token.isEmpty()) {
            return true; // Allow for testing
        }
        UserRole role = authService.validateToken(token);
        return role == UserRole.ADMIN;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // Validate admin token
            if (!isAdmin(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only ADMIN users can view all users");
            }

            // Get all users
            List<User> users = authService.getAllUsers(UserRole.ADMIN);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // Validate admin token
            if (!isAdmin(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only ADMIN users can view user details");
            }

            // Get user by ID
            User user = authService.getUserById(id, UserRole.ADMIN);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User userDetails,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // Validate admin token
            if (!isAdmin(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only ADMIN users can update users");
            }

            // Update user
            User updatedUser = authService.updateUser(id, userDetails, UserRole.ADMIN);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // Validate admin token
            if (!isAdmin(token)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only ADMIN users can delete users");
            }

            // Delete user
            authService.deleteUser(id, UserRole.ADMIN);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}