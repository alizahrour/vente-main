package com.telecom.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.telecom.crm.dto.CreateQuoteRequest;
import com.telecom.crm.entity.Customer;
import com.telecom.crm.entity.Quote;
import com.telecom.crm.entity.QuoteCreditDuration;
import com.telecom.crm.entity.QuoteNetworkType;
import com.telecom.crm.entity.QuoteOrderSegment;
import com.telecom.crm.entity.QuoteOrderStartType;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.mapper.QuoteMapper;
import com.telecom.crm.repository.CustomerRepository;
import com.telecom.crm.repository.QuoteRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QuoteServiceTest {

    @Mock
    private QuoteRepository quoteRepository;

    @Mock
    private CustomerRepository customerRepository;

    private QuoteService quoteService;

    @BeforeEach
    void setUp() {
        quoteService = new QuoteService(
                quoteRepository,
                customerRepository,
                new QuoteMapper()
        );
    }

    @Test
    void createQuoteShouldCreateDraftForExistingCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer()));
        when(quoteRepository.save(any(Quote.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = quoteService.createQuote(new CreateQuoteRequest(
                1L,
                "sara.bennani@example.com",
                "RET00000000001731",
                QuoteOrderSegment.RETAIL,
                QuoteNetworkType.DIRECT_NETWORK,
                QuoteCreditDuration.NA,
                LocalDate.now().plusDays(7),
                QuoteOrderStartType.IMMEDIATE,
                "Description du devis"
        ));

        assertThat(response.customerId()).isEqualTo(1L);
        assertThat(response.customerNameSnapshot()).isEqualTo("Sara Bennani");
        assertThat(response.customerContactSnapshot()).isEqualTo("sara.bennani@example.com");
        assertThat(response.billingAccount()).isEqualTo("RET00000000001731");
        assertThat(response.status()).isEqualTo("DRAFT");
    }

    @Test
    void createQuoteShouldRejectUnknownCustomer() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quoteService.createQuote(new CreateQuoteRequest(
                99L,
                "contact@example.com",
                "RET00000000001731",
                QuoteOrderSegment.RETAIL,
                QuoteNetworkType.DIRECT_NETWORK,
                QuoteCreditDuration.NA,
                LocalDate.now().plusDays(7),
                QuoteOrderStartType.IMMEDIATE,
                "Description"
        )))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Client introuvable");
    }

    @Test
    void createQuoteShouldSetInitialStatusDraft() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer()));
        when(quoteRepository.save(any(Quote.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = quoteService.createQuote(new CreateQuoteRequest(
                1L,
                null,
                "RET00000000001731",
                QuoteOrderSegment.RETAIL,
                QuoteNetworkType.DIRECT_NETWORK,
                null,
                LocalDate.now().plusDays(7),
                QuoteOrderStartType.IMMEDIATE,
                null
        ));

        assertThat(response.status()).isEqualTo("DRAFT");
        assertThat(response.paymentType()).isEqualTo("UPFRONT");
        assertThat(response.creditDuration()).isEqualTo("NA");
    }

    @Test
    void createQuoteShouldSetUpfrontPaymentTypeWhenCreditDurationIsNa() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer()));
        when(quoteRepository.save(any(Quote.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = quoteService.createQuote(new CreateQuoteRequest(
                1L,
                null,
                "RET00000000001731",
                QuoteOrderSegment.RETAIL,
                QuoteNetworkType.DIRECT_NETWORK,
                QuoteCreditDuration.NA,
                LocalDate.now().plusDays(7),
                QuoteOrderStartType.IMMEDIATE,
                null
        ));

        assertThat(response.paymentType()).isEqualTo("UPFRONT");
    }

    @Test
    void createQuoteShouldSetCreditPaymentTypeWhenCreditDurationIsTwelveMonths() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer()));
        when(quoteRepository.save(any(Quote.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = quoteService.createQuote(new CreateQuoteRequest(
                1L,
                "0661002003",
                "RET00000000001731",
                QuoteOrderSegment.RETAIL,
                QuoteNetworkType.DIRECT_NETWORK,
                QuoteCreditDuration.MONTH_12,
                LocalDate.now().plusDays(7),
                QuoteOrderStartType.IMMEDIATE,
                "Paiement a credit"
        ));

        assertThat(response.paymentType()).isEqualTo("CREDIT");
        assertThat(response.creditDuration()).isEqualTo("MONTH_12");
    }

    @Test
    void createQuoteShouldStartWithZeroTotalAmount() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer()));
        when(quoteRepository.save(any(Quote.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = quoteService.createQuote(new CreateQuoteRequest(
                1L,
                "0661002003",
                "RET00000000001731",
                QuoteOrderSegment.RETAIL,
                QuoteNetworkType.DIRECT_NETWORK,
                QuoteCreditDuration.NA,
                LocalDate.now().plusDays(7),
                QuoteOrderStartType.IMMEDIATE,
                null
        ));

        assertThat(response.totalAmount()).isEqualByComparingTo("0.00");
        assertThat(response.items()).isEmpty();
    }

    private Customer customer() {
        return Customer.builder()
                .id(1L)
                .firstName("Sara")
                .lastName("Bennani")
                .cin("CIN123")
                .phone("0600000000")
                .email("sara.bennani@example.com")
                .build();
    }
}
