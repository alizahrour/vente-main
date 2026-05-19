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
import com.telecom.crm.entity.Offer;
import com.telecom.crm.repository.CustomerRepository;
import com.telecom.crm.repository.OfferRepository;
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
class AuthAndSalesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OfferRepository offerRepository;

    private String token;
    private Customer customer;
    private Offer offer;

    @BeforeEach
    void setUp() throws Exception {
        token = obtainToken("agent", "agent123");
        customer = customerRepository.findAll().stream().findFirst().orElseThrow();
        offer = offerRepository.findAll().stream().findFirst().orElseThrow();
    }

    @Test
    void loginShouldReturnJwtToken() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin", "admin123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void salesFlowShouldCreateValidatePayAndGenerateInvoice() throws Exception {
        String salePayload = """
                {
                  "customerId": %d,
                  "items": [
                    {
                      "offerId": %d,
                      "quantity": 2
                    }
                  ]
                }
                """.formatted(customer.getId(), offer.getId());

        MvcResult createResult = mockMvc.perform(post("/api/sales")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(salePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andReturn();

        JsonNode createJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long saleId = createJson.get("id").asLong();
        String totalAmount = createJson.get("totalAmount").asText();

        mockMvc.perform(post("/api/sales/{id}/validate", saleId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("VALIDATED"));

        mockMvc.perform(post("/api/sales/{id}/payments", saleId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "amount": %s,
                                  "method": "CASH"
                                }
                                """.formatted(totalAmount)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.invoiceNumber").isNotEmpty());

        mockMvc.perform(get("/api/sales/{id}/invoice", saleId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saleId").value(saleId))
                .andExpect(jsonPath("$.items", hasSize(1)));
    }

    @Test
    void paymentShouldRejectDifferentAmount() throws Exception {
        String salePayload = """
                {
                  "customerId": %d,
                  "items": [
                    {
                      "offerId": %d,
                      "quantity": 1
                    }
                  ]
                }
                """.formatted(customer.getId(), offer.getId());

        MvcResult createResult = mockMvc.perform(post("/api/sales")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(salePayload))
                .andExpect(status().isOk())
                .andReturn();

        long saleId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(post("/api/sales/{id}/validate", saleId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/sales/{id}/payments", saleId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "amount": 1,
                                  "method": "CASH"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Le montant paye doit correspondre exactement au montant total."));
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
