package com.telecom.crm.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.crm.dto.LoginRequest;
import com.telecom.crm.entity.Customer;
import com.telecom.crm.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class QuoteIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    private String token;
    private Customer customer;

    @BeforeEach
    void setUp() throws Exception {
        token = obtainToken("agent", "agent123");
        customer = customerRepository.findAll().stream().findFirst().orElseThrow();
    }

    @Test
    void quoteFlowShouldCreateDraftAndReturnDetail() throws Exception {
        String payload = """
                {
                  "customerId": %d,
                  "customerContact": "contact.client@example.com",
                  "billingAccount": "RET00000000001731",
                  "orderSegment": "RETAIL",
                  "networkType": "DIRECT_NETWORK",
                  "creditDuration": "NA",
                  "quoteExpirationDate": "2026-06-22",
                  "orderStartType": "IMMEDIATE",
                  "description": "Description du devis"
                }
                """.formatted(customer.getId());

        MvcResult createResult = mockMvc.perform(post("/api/quotes")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.totalAmount").value(0))
                .andExpect(jsonPath("$.customerNameSnapshot").isNotEmpty())
                .andExpect(jsonPath("$.customerContactSnapshot").value("contact.client@example.com"))
                .andExpect(jsonPath("$.billingAccount").value("RET00000000001731"))
                .andExpect(jsonPath("$.orderSegment").value("RETAIL"))
                .andExpect(jsonPath("$.networkType").value("DIRECT_NETWORK"))
                .andExpect(jsonPath("$.items", hasSize(0)))
                .andReturn();

        JsonNode createJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long quoteId = createJson.get("id").asLong();

        mockMvc.perform(get("/api/quotes/{id}", quoteId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(quoteId))
                .andExpect(jsonPath("$.customerId").value(customer.getId()))
                .andExpect(jsonPath("$.customerNameSnapshot").isNotEmpty())
                .andExpect(jsonPath("$.customerContactSnapshot").value("contact.client@example.com"))
                .andExpect(jsonPath("$.billingAccount").value("RET00000000001731"))
                .andExpect(jsonPath("$.orderSegment").value("RETAIL"))
                .andExpect(jsonPath("$.networkType").value("DIRECT_NETWORK"))
                .andExpect(jsonPath("$.paymentType").value("UPFRONT"))
                .andExpect(jsonPath("$.creditDuration").value("NA"))
                .andExpect(jsonPath("$.quoteExpirationDate").value("2026-06-22"))
                .andExpect(jsonPath("$.orderStartType").value("IMMEDIATE"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    private String obtainToken(String username, String password) throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(username, password))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode jsonNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return jsonNode.get("token").asText();
    }
}
