package com.telecom.crm.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SaleResponse(
        Long id,
        String saleNumber,
        Long customerId,
        String customerName,
        String customerPhone,
        String status,
        String cancellationReason,
        BigDecimal totalAmount,
        boolean paid,
        LocalDateTime createdAt,
        LocalDateTime validatedAt,
        String agent,
        List<SaleItemResponse> items
) {
}
