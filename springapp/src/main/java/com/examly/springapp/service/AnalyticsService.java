package com.examly.springapp.service;

import com.examly.springapp.model.Customer;
import com.examly.springapp.model.Interaction;
import com.examly.springapp.repository.CustomerRepository;
import com.examly.springapp.repository.InteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InteractionRepository interactionRepository;

    public Map<String, Object> getCustomerStatistics() {
        List<Customer> customers = customerRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", customers.size());
        
        // Count customers by status (using customerType instead of status)
        Map<String, Long> customersByStatus = customers.stream()
                .collect(Collectors.groupingBy(customer -> customer.getCustomerType().toString(), Collectors.counting()));
        stats.put("customersByStatus", customersByStatus);
        
        // Count customers by industry (using email domain as proxy for industry since industry field doesn't exist)
        Map<String, Long> customersByIndustry = customers.stream()
                .filter(customer -> customer.getEmail() != null && customer.getEmail().contains("@"))
                .collect(Collectors.groupingBy(customer -> customer.getEmail().split("@")[1], Collectors.counting()));
        stats.put("customersByIndustry", customersByIndustry);
        
        return stats;
    }

    public Map<String, Object> getInteractionStatistics() {
        List<Interaction> interactions = interactionRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalInteractions", interactions.size());
        
        // Count interactions by type
        Map<String, Long> interactionsByType = interactions.stream()
                .collect(Collectors.groupingBy(interaction -> interaction.getInteractionType().toString(), Collectors.counting()));
        stats.put("interactionsByType", interactionsByType);
        
        // Average interactions per customer
        if (!interactions.isEmpty()) {
            long customerCount = customerRepository.count();
            double avgInteractionsPerCustomer = customerCount > 0 ? 
                    (double) interactions.size() / customerCount : 0;
            stats.put("avgInteractionsPerCustomer", avgInteractionsPerCustomer);
        } else {
            stats.put("avgInteractionsPerCustomer", 0);
        }
        
        return stats;
    }

    public Map<String, Integer> getMonthlyInteractionCounts() {
        List<Interaction> interactions = interactionRepository.findAll();
        Map<Month, Integer> countsByMonth = new HashMap<>();
        
        // Initialize all months with zero
        for (Month month : Month.values()) {
            countsByMonth.put(month, 0);
        }
        
        // Count interactions by month
        for (Interaction interaction : interactions) {
            LocalDateTime dateTime = interaction.getInteractionDate();
            if (dateTime != null) {
                Month month = dateTime.getMonth();
                countsByMonth.put(month, countsByMonth.getOrDefault(month, 0) + 1);
            }
        }
        
        // Convert to map with month names
        Map<String, Integer> result = new LinkedHashMap<>(); // Preserve order
        for (Month month : Month.values()) {
            String monthName = month.getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            result.put(monthName, countsByMonth.get(month));
        }
        
        return result;
    }

    public Map<String, Integer> getInteractionTypeDistribution() {
        List<Interaction> interactions = interactionRepository.findAll();
        Map<String, Integer> typeDistribution = new HashMap<>();
        
        // Count interactions by type
        for (Interaction interaction : interactions) {
            String type = interaction.getInteractionType().toString();
            typeDistribution.put(type, typeDistribution.getOrDefault(type, 0) + 1);
        }
        
        return typeDistribution;
    }
}