package com.examly.springapp.controller;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.dto.UserRegistrationRequest;
import com.examly.springapp.model.User;
import com.examly.springapp.model.UserRole;
import com.examly.springapp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
// @CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (authService.validateToken(token) != null) {
                return ResponseEntity.ok("Valid");
            }
            return ResponseEntity.badRequest().body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }

    @PostMapping("/register-user")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody UserRegistrationRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            // Validate admin token
            UserRole adminRole = authService.validateToken(token);
            if (adminRole != UserRole.ADMIN) {
                return ResponseEntity.status(403).body("Only ADMIN users can register new users");
            }

            // Register the new user
            User newUser = authService.registerUser(request, adminRole);

            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to register user");
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        try {
            // Validate admin token
            UserRole adminRole = authService.validateToken(token);
            if (adminRole != UserRole.ADMIN) {
                return ResponseEntity.status(403).body("Only ADMIN users can view all users");
            }

            // Get all users
            List<User> users = authService.getAllUsers(adminRole);

            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to retrieve users");
        }
    }
}