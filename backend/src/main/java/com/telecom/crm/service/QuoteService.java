package com.telecom.crm.service;

import com.telecom.crm.dto.CreateQuoteRequest;
import com.telecom.crm.dto.QuoteResponse;
import com.telecom.crm.entity.Customer;
import com.telecom.crm.entity.Quote;
import com.telecom.crm.entity.QuoteCreditDuration;
import com.telecom.crm.entity.QuoteCustomerType;
import com.telecom.crm.entity.QuoteNetworkType;
import com.telecom.crm.entity.QuoteOrderSegment;
import com.telecom.crm.entity.QuoteOrderStartType;
import com.telecom.crm.entity.QuotePaymentType;
import com.telecom.crm.entity.QuoteStatus;
import com.telecom.crm.exception.BadRequestException;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.mapper.QuoteMapper;
import com.telecom.crm.repository.CustomerRepository;
import com.telecom.crm.repository.QuoteRepository;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final CustomerRepository customerRepository;
    private final QuoteMapper quoteMapper;

    public QuoteService(
            QuoteRepository quoteRepository,
            CustomerRepository customerRepository,
            QuoteMapper quoteMapper
    ) {
        this.quoteRepository = quoteRepository;
        this.customerRepository = customerRepository;
        this.quoteMapper = quoteMapper;
    }

    @Transactional
    public QuoteResponse createQuote(CreateQuoteRequest request) {
        Customer customer = resolveCustomer(request.customerId());
        QuoteCreditDuration creditDuration = resolveCreditDuration(request.creditDuration());
        QuotePaymentType paymentType = resolvePaymentType(creditDuration);
        validateQuoteExpirationDate(request.quoteExpirationDate());

        Quote quote = Quote.builder()
                .quoteNumber(generateQuoteNumber())
                .customer(customer)
                .customerNameSnapshot(customer.getFullName())
                .customerContactSnapshot(resolveCustomerContact(customer, request.customerContact()))
                .billingAccount(request.billingAccount().trim())
                .orderSegment(request.orderSegment())
                .networkType(request.networkType())
                .customerType(QuoteCustomerType.INDIVIDUAL)
                .paymentType(paymentType)
                .creditDuration(creditDuration)
                .quoteExpirationDate(request.quoteExpirationDate())
                .orderStartType(request.orderStartType())
                .description(normalizeDescription(request.description()))
                .status(QuoteStatus.DRAFT)
                .build();

        return quoteMapper.toResponse(quoteRepository.save(quote));
    }

    public QuoteResponse getQuote(Long id) {
        return quoteMapper.toResponse(findQuote(id));
    }

    public Quote findQuote(Long id) {
        return quoteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Devis introuvable."));
    }

    private Customer resolveCustomer(Long customerId) {
        if (customerId == null) {
            throw new BadRequestException("Operation impossible: un client existant est obligatoire pour ce devis.");
        }

        return customerRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Client introuvable."));
    }

    private QuoteCreditDuration resolveCreditDuration(QuoteCreditDuration requestedCreditDuration) {
        return requestedCreditDuration != null ? requestedCreditDuration : QuoteCreditDuration.NA;
    }

    private QuotePaymentType resolvePaymentType(QuoteCreditDuration creditDuration) {
        return creditDuration == QuoteCreditDuration.NA
                ? QuotePaymentType.UPFRONT
                : QuotePaymentType.CREDIT;
    }

    private void validateQuoteExpirationDate(LocalDate quoteExpirationDate) {
        if (quoteExpirationDate == null) {
            throw new BadRequestException("La date d'expiration du devis est obligatoire.");
        }

        if (quoteExpirationDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("La date d'expiration du devis ne peut pas etre dans le passe.");
        }
    }

    private String resolveCustomerContact(Customer customer, String requestedCustomerContact) {
        if (StringUtils.hasText(requestedCustomerContact)) {
            return requestedCustomerContact.trim();
        }

        if (StringUtils.hasText(customer.getEmail())) {
            return customer.getEmail().trim();
        }

        return customer.getPhone();
    }

    private String normalizeDescription(String description) {
        return StringUtils.hasText(description) ? description.trim() : null;
    }

    private String generateQuoteNumber() {
        String candidate;

        do {
            candidate = "QUO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (quoteRepository.existsByQuoteNumber(candidate));

        return candidate;
    }
}
