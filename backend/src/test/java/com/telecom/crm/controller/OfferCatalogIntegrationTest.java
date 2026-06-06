package com.telecom.crm.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telecom.crm.dto.LoginRequest;
import com.telecom.crm.entity.Customer;
import com.telecom.crm.entity.Offer;
import com.telecom.crm.entity.OfferCategory;
import com.telecom.crm.entity.Quote;
import com.telecom.crm.entity.QuoteCreditDuration;
import com.telecom.crm.entity.QuoteCustomerType;
import com.telecom.crm.entity.QuoteNetworkType;
import com.telecom.crm.entity.QuoteOrderSegment;
import com.telecom.crm.entity.QuoteOrderStartType;
import com.telecom.crm.entity.QuotePaymentType;
import com.telecom.crm.entity.QuoteStatus;
import com.telecom.crm.repository.CustomerRepository;
import com.telecom.crm.repository.OfferRepository;
import com.telecom.crm.repository.QuoteRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OfferCatalogIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String token;
    private Quote draftQuote;

    @BeforeEach
    void setUp() throws Exception {
        token = obtainToken("agent", "agent123");
        jdbcTemplate.execute("DELETE FROM sale_items");
        jdbcTemplate.execute("DELETE FROM payments");
        jdbcTemplate.execute("DELETE FROM invoices");
        jdbcTemplate.execute("DELETE FROM quote_items");
        jdbcTemplate.execute("DELETE FROM sales");
        jdbcTemplate.execute("DELETE FROM quotes");
        jdbcTemplate.execute("DELETE FROM offers");

        Customer customer = customerRepository.findAll().stream().findFirst().orElseThrow();
        draftQuote = quoteRepository.save(Quote.builder()
                .quoteNumber("QUO-CATALOG-001")
                .customer(customer)
                .customerNameSnapshot(customer.getFullName())
                .customerContactSnapshot(customer.getEmail())
                .billingAccount("RET00000000001731")
                .orderSegment(QuoteOrderSegment.RETAIL)
                .networkType(QuoteNetworkType.DIRECT_NETWORK)
                .customerType(QuoteCustomerType.INDIVIDUAL)
                .paymentType(QuotePaymentType.UPFRONT)
                .creditDuration(QuoteCreditDuration.NA)
                .quoteExpirationDate(LocalDate.now().plusDays(7))
                .orderStartType(QuoteOrderStartType.IMMEDIATE)
                .description("catalog")
                .status(QuoteStatus.DRAFT)
                .totalAmount(BigDecimal.ZERO)
                .build());

        offerRepository.save(Offer.builder()
                .code("JWL-001")
                .existingCode("OLD-JWL-001")
                .name("Jawal Illimite")
                .category(OfferCategory.RECHARGE)
                .description("Recharge physique")
                .productTypeCode("RECHARGE")
                .productTypeDescription("Recharge physique")
                .hierarchyCode("Recharge")
                .price(new BigDecimal("50.00"))
                .duration(30)
                .eligibleForNormalCustomer(true)
                .bundle(false)
                .active(true)
                .build());
        offerRepository.save(Offer.builder()
                .code("PACK-001")
                .existingCode("OLD-PACK-001")
                .name("Pack Smartphone")
                .category(OfferCategory.BOX)
                .description("poste bundle")
                .productTypeCode("PACK")
                .productTypeDescription("poste bundle")
                .hierarchyCode("PACK")
                .price(new BigDecimal("2499.00"))
                .duration(30)
                .eligibleForNormalCustomer(true)
                .bundle(true)
                .active(true)
                .build());
        offerRepository.save(Offer.builder()
                .code("CORP-001")
                .name("Offre entreprise")
                .category(OfferCategory.INTERNET)
                .description("Reservee")
                .productTypeCode("SERVICE")
                .productTypeDescription("Service pro")
                .hierarchyCode("Service")
                .price(new BigDecimal("800.00"))
                .duration(30)
                .eligibleForNormalCustomer(false)
                .bundle(false)
                .active(true)
                .build());
        offerRepository.save(Offer.builder()
                .code("DELIVERY-001")
                .name("Frais de livraison express")
                .category(OfferCategory.MOBILE)
                .description("Frais de livraison")
                .productTypeCode("SERVICE")
                .productTypeDescription("Frais de livraison")
                .hierarchyCode("Service")
                .price(new BigDecimal("30.00"))
                .duration(30)
                .eligibleForNormalCustomer(true)
                .bundle(false)
                .active(true)
                .build());
        offerRepository.save(Offer.builder()
                .code("INACTIVE-001")
                .name("Accessoire inactif")
                .category(OfferCategory.MOBILE)
                .description("Accessoire")
                .productTypeCode("ACCESS")
                .productTypeDescription("Accessoires")
                .hierarchyCode("Accessoires")
                .price(new BigDecimal("20.00"))
                .duration(30)
                .eligibleForNormalCustomer(true)
                .bundle(false)
                .active(false)
                .build());
    }

    @Test
    void eligibleOffersShouldReturnProductsForDraftQuoteWithoutInitialCategoryFilter() throws Exception {
        mockMvc.perform(get("/api/offers/eligible")
                        .header("Authorization", "Bearer " + token)
                        .param("quoteId", draftQuote.getId().toString())
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].eligibleForNormalCustomer").value(true));
    }

    @Test
    void eligibleOffersShouldSearchByName() throws Exception {
        mockMvc.perform(get("/api/offers/eligible")
                        .header("Authorization", "Bearer " + token)
                        .param("quoteId", draftQuote.getId().toString())
                        .param("search", "Jawal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].code").value("JWL-001"));
    }

    @Test
    void eligibleOffersShouldSearchByCode() throws Exception {
        mockMvc.perform(get("/api/offers/eligible")
                        .header("Authorization", "Bearer " + token)
                        .param("quoteId", draftQuote.getId().toString())
                        .param("search", "PACK-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].bundle").value(true));
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
