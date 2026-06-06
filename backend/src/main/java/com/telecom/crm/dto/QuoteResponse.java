package com.telecom.crm.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record QuoteResponse(
        Long id,
        String quoteNumber,
        Long customerId,
        String customerNameSnapshot,
        String customerContactSnapshot,
        String billingAccount,
        String orderSegment,
        String networkType,
        String customerType,
        String paymentType,
        String creditDuration,
        LocalDate quoteExpirationDate,
        String orderStartType,
        String description,
        String status,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<QuoteItemResponse> items
) {
}
