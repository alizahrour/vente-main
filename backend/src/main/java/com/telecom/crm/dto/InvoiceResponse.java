package com.telecom.crm.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InvoiceResponse(
        String invoiceNumber,
        Long saleId,
        String saleNumber,
        LocalDateTime generatedAt,
        String customerName,
        String customerCin,
        String customerPhone,
        String customerEmail,
        String customerAddress,
        String customerCity,
        String agentName,
        String agentUsername,
        BigDecimal totalAmount,
        String method,
        String paymentReference,
        List<SaleItemResponse> items
) {
}
