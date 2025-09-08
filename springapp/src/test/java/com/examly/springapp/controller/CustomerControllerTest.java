package com.examly.springapp.controller;

import com.examly.springapp.model.Customer;
import com.examly.springapp.model.CustomerType;
import com.examly.springapp.repository.CustomerRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestConfig.class)
class CustomerControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        customerRepository.deleteAll();
    }

    @Test
    @DisplayName("testCreateCustomerSuccess")
    void testCreateCustomerSuccess() throws Exception {
        Customer customer = new Customer();
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setEmail("john.doe@example.com");
        customer.setPhoneNumber("1234567890");
        customer.setCustomerType(CustomerType.REGULAR);

        ResultActions result = mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customer)));

        result.andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.customerType").value("REGULAR"))
                .andExpect(jsonPath("$.registrationDate").exists());
    }

    @Test
    @DisplayName("testCreateCustomerWithInvalidEmail")
    void testCreateCustomerWithInvalidEmail() throws Exception {
        Customer customer = new Customer();
        customer.setFirstName("Jane");
        customer.setLastName("Doe");
        customer.setEmail("invalid-email");
        customer.setCustomerType(CustomerType.PREMIUM);

        ResultActions result = mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customer)));

        result.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid email format")));
    }

    @Test
    @DisplayName("testCreateCustomerWithDuplicateEmail")
    void testCreateCustomerWithDuplicateEmail() throws Exception {
        Customer customer = new Customer();
        customer.setFirstName("John");
        customer.setLastName("Smith");
        customer.setEmail("dup@example.com");
        customer.setCustomerType(CustomerType.REGULAR);
        customer.setRegistrationDate(LocalDate.now());
        customerRepository.save(customer);

        Customer customer2 = new Customer();
        customer2.setFirstName("Alice");
        customer2.setLastName("Smith");
        customer2.setEmail("dup@example.com");
        customer2.setCustomerType(CustomerType.PREMIUM);
        // no need to set registrationDate since we use endpoint for POST

        ResultActions result = mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customer2)));

        result.andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("testCreateCustomerWithInvalidCustomerType")
    void testCreateCustomerWithInvalidCustomerType() throws Exception {
        String badJson = "{\n  \"firstName\": \"Foo\",\n  \"lastName\": \"Bar\",\n  \"email\": \"foo@bar.com\",\n  \"customerType\": \"GOLD\"\n}";
        ResultActions result = mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(badJson));
        result.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid customerType")));
    }

    @Test
    @DisplayName("testGetAllCustomers")
    void testGetAllCustomers() throws Exception {
        Customer customer = new Customer();
        customer.setFirstName("Test");
        customer.setLastName("User");
        customer.setEmail("testuser@example.com");
        customer.setCustomerType(CustomerType.REGULAR);
        customer.setRegistrationDate(LocalDate.now());
        customerRepository.save(customer);

        ResultActions result = mockMvc.perform(get("/api/customers"));
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].email").value("testuser@example.com"));
    }

    @Test
    @DisplayName("testGetAllCustomersEmptyList")
    void testGetAllCustomersEmptyList() throws Exception {
        ResultActions result = mockMvc.perform(get("/api/customers"));
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("testGetCustomerById")
    void testGetCustomerById() throws Exception {
        Customer customer = new Customer();
        customer.setFirstName("Fetch");
        customer.setLastName("Me");
        customer.setEmail("fetchme@example.com");
        customer.setCustomerType(CustomerType.VIP);
        customer.setRegistrationDate(LocalDate.now());
        Customer saved = customerRepository.save(customer);

        ResultActions result = mockMvc.perform(get("/api/customers/" + saved.getId()));
        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()))
                .andExpect(jsonPath("$.firstName").value("Fetch"));
    }

    @Test
    @DisplayName("testGetCustomerByIdNotFound")
    void testGetCustomerByIdNotFound() throws Exception {
        ResultActions result = mockMvc.perform(get("/api/customers/404404"));
        result.andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("not found")));
    }
}
