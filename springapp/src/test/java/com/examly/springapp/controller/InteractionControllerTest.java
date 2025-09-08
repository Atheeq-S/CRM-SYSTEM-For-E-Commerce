package com.examly.springapp.controller;

import com.examly.springapp.model.Customer;
import com.examly.springapp.model.CustomerType;
import com.examly.springapp.model.Interaction;
import com.examly.springapp.model.InteractionStatus;
import com.examly.springapp.model.InteractionType;
import com.examly.springapp.repository.CustomerRepository;
import com.examly.springapp.repository.InteractionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import com.examly.springapp.config.TestConfig;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestConfig.class)
class InteractionControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private InteractionRepository interactionRepository;
    @Autowired
    private ObjectMapper objectMapper;

    private Long existingCustomerId;

    @BeforeEach
    void setUp() {
        interactionRepository.deleteAll();
        customerRepository.deleteAll();
        Customer c = new Customer();
        c.setFirstName("Jane");
        c.setLastName("Cust");
        c.setEmail("custjane@t.com");
        c.setCustomerType(CustomerType.PREMIUM);
        c.setRegistrationDate(LocalDate.now());
        c = customerRepository.save(c);
        existingCustomerId = c.getId();
    }

    @Test
    @DisplayName("testCreateInteractionSuccess")
    void testCreateInteractionSuccess() throws Exception {
        Interaction interaction = new Interaction();
        interaction.setCustomerId(existingCustomerId);
        interaction.setInteractionType(InteractionType.INQUIRY);
        interaction.setDescription("Customer asked about product availability");
        interaction.setStatus(InteractionStatus.OPEN);

        ResultActions result = mockMvc.perform(post("/api/interactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(interaction)));

        result.andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.customerId").value(existingCustomerId))
                .andExpect(jsonPath("$.interactionType").value("INQUIRY"))
                .andExpect(jsonPath("$.interactionDate").exists())
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @DisplayName("testCreateInteractionWithNonExistentCustomer")
    void testCreateInteractionWithNonExistentCustomer() throws Exception {
        Interaction interaction = new Interaction();
        interaction.setCustomerId(77777L);
        interaction.setInteractionType(InteractionType.RETURN);
        interaction.setDescription("Customer returned item");
        interaction.setStatus(InteractionStatus.RESOLVED);

        ResultActions result = mockMvc.perform(post("/api/interactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(interaction)));

        result.andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("not found")));
    }

    @Test
    @DisplayName("testCreateInteractionWithInvalidType")
    void testCreateInteractionWithInvalidType() throws Exception {
        String badJson = String.format(
                "{\n  \"customerId\": %d,\n  \"interactionType\": \"CONSULT\",\n  \"description\": \"Blah blaa\",\n  \"status\": \"OPEN\"\n}",
                existingCustomerId);
        ResultActions result = mockMvc.perform(post("/api/interactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(badJson));
        result.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid interactionType")));
    }

    @Test
    @DisplayName("testCreateInteractionWithInvalidStatus")
    void testCreateInteractionWithInvalidStatus() throws Exception {
        String badJson = String.format(
                "{\n  \"customerId\": %d,\n  \"interactionType\": \"INQUIRY\",\n  \"description\": \"Test interaction\",\n  \"status\": \"INVALID_STATUS\"\n}",
                existingCustomerId);
        ResultActions result = mockMvc.perform(post("/api/interactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(badJson));
        result.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid status")));
    }

    @Test
    @DisplayName("testGetInteractionsByCustomerId")
    void testGetInteractionsByCustomerId() throws Exception {
        Interaction i = new Interaction();
        i.setCustomerId(existingCustomerId);
        i.setInteractionType(InteractionType.PURCHASE);
        i.setDescription("This is a purchase interaction");
        i.setStatus(InteractionStatus.RESOLVED);
        i.setInteractionDate(LocalDateTime.now()); // ensures not-null
        interactionRepository.save(i);

        ResultActions result = mockMvc.perform(get("/api/customers/" + existingCustomerId + "/interactions"));
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].interactionType").value("PURCHASE"));
    }

    @Test
    @DisplayName("testGetInteractionsByCustomerIdEmptyList")
    void testGetInteractionsByCustomerIdEmptyList() throws Exception {
        ResultActions result = mockMvc.perform(get("/api/customers/" + existingCustomerId + "/interactions"));
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
