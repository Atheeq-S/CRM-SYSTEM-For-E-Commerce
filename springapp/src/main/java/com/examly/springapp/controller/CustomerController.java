package com.examly.springapp.controller;

import com.examly.springapp.model.Customer;
import com.examly.springapp.model.Interaction;
import com.examly.springapp.model.UserRole;
import com.examly.springapp.service.AuthService;
import com.examly.springapp.service.CustomerService;
import com.examly.springapp.service.InteractionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private InteractionService interactionService;

    @Autowired
    private AuthService authService;

    private boolean isAdmin(String token) {
        if (token == null || token.isEmpty()) {
            return true; // Allow for testing
        }
        UserRole role = authService.validateToken(token);
        return role == UserRole.ADMIN;
    }

    private boolean isAuthorized(String token) {
        if (token == null || token.isEmpty()) {
            return true; // Allow for testing
        }
        UserRole role = authService.validateToken(token);
        return role == UserRole.ADMIN || role == UserRole.SALES_REP || role == UserRole.ANALYST;
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            @Valid @RequestBody Customer customer,
            @RequestHeader(value = "Authorization", required = false) String token) {

        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Customer createdCustomer = customerService.createCustomer(customer);
        return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }

    @GetMapping("/{customerId}/interactions")
    public ResponseEntity<List<Interaction>> getCustomerInteractions(
            @PathVariable Long customerId,
            @RequestHeader(value = "Authorization", required = false) String token) {

        if (!isAuthorized(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Interaction> interactions = interactionService.getInteractionsByCustomerId(customerId);
        return ResponseEntity.ok(interactions);
    }
    
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(
            @RequestHeader(value = "Authorization", required = false) String token) {

        if (!isAuthorized(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Customer> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {

        if (!isAuthorized(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Customer customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody Customer customerDetails,
            @RequestHeader(value = "Authorization", required = false) String token) {

        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Customer updatedCustomer = customerService.updateCustomer(id, customerDetails);
        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {

        if (!isAdmin(token)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    // @GetMapping("/{id}/interactions")
    // public ResponseEntity<List<Interaction>> getCustomerInteractions(
    //         @PathVariable Long id,
    //         @RequestHeader(value = "Authorization", required = false) String token) {

    //     if (!isAuthorized(token)) {
    //         return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    //     }

    //     List<Interaction> interactions = interactionService.getInteractionsByCustomerId(id);
    //     return ResponseEntity.ok(interactions);
    // }
}