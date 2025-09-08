package com.examly.springapp.config;

import com.examly.springapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private AuthService authService;

    @Override
    public void run(String... args) throws Exception {
        // Create default users when application starts
        authService.createDefaultUsers();
        System.out.println("Default users created:");
        System.out.println("Admin - username: admin, password: admin123");
        System.out.println("Sales Rep - username: sales, password: sales123");
    }
}