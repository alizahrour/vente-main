package com.telecom.crm.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long saleId,
        BigDecimal amount,
        String method,
        String status,
        LocalDateTime paidAt,
        String reference,
        String invoiceNumber
) {
}
