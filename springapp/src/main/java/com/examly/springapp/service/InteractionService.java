package com.examly.springapp.service;

import com.examly.springapp.exception.CustomerNotFoundException;
import com.examly.springapp.model.Customer;
import com.examly.springapp.model.Interaction;
import com.examly.springapp.model.InteractionStatus;
import com.examly.springapp.repository.CustomerRepository;
import com.examly.springapp.repository.InteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InteractionService {

    @Autowired
    private InteractionRepository interactionRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // public Interaction createInteraction(Interaction interaction) {
    //     // Handle both cases: when customerId is set directly or when customer object is
    //     // provided
    //     Long customerId = null;

    //     if (interaction.getCustomer() != null && interaction.getCustomer().getId() != null) {
    //         customerId = interaction.getCustomer().getId();
    //     } else if (interaction.getCustomerId() != null) {
    //         customerId = interaction.getCustomerId();
    //     } else {
    //         throw new IllegalArgumentException("Customer ID is required");
    //     }

    //     // Verify customer exists
    //     Customer customer = customerRepository.findById(customerId)
    //             .orElseThrow(() -> new RuntimeException("Customer not found"));

    //     // Set both the customer object and customerId for proper persistence
    //     interaction.setCustomer(customer);
    //     interaction.setCustomerId(customerId);

    //     return interactionRepository.save(interaction);
    // }

    public Interaction createInteraction(Interaction interaction) {
        // Verify customer exists
        if (interaction.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID is required");
        }

        if (!customerRepository.existsById(interaction.getCustomerId())) {
            throw new CustomerNotFoundException("Customer not found with id: " + interaction.getCustomerId());
        }

        // Create a transient customer object just for persistence
        Customer customer = new Customer();
        customer.setId(interaction.getCustomerId());
        interaction.setCustomer(customer);

        return interactionRepository.save(interaction);
    }

    public Interaction getInteractionById(Long id) {
        return interactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interaction not found"));
    }

    public Interaction updateInteraction(Long id, Interaction interactionDetails) {
        Interaction interaction = getInteractionById(id);
        // Update fields as needed
        interaction.setInteractionType(interactionDetails.getInteractionType());
        interaction.setDescription(interactionDetails.getDescription());
        interaction.setInteractionDate(interactionDetails.getInteractionDate());
        interaction.setStatus(interactionDetails.getStatus());
        return interactionRepository.save(interaction);
    }

    public void deleteInteraction(Long id) {
        interactionRepository.deleteById(id);
    }

    // public List<Interaction> getInteractionsByCustomerId(Long customerId) {
    //     return interactionRepository.findByCustomerId(customerId);
    // }

    public List<Interaction> getInteractionsByCustomerId(Long customerId) {
        return interactionRepository.findByCustomerId(customerId);
    }

    public Map<String, Long> getInteractionCounts() {
        Map<String, Long> counts = new HashMap<>();

        // Get total count of all interactions
        long totalCount = interactionRepository.count();

        // Get count of pending interactions
        long pendingCount = interactionRepository.countByStatus(InteractionStatus.PENDING);

        counts.put("totalInteractions", totalCount);
        counts.put("pendingInteractions", pendingCount);

        return counts;
        }
    }

