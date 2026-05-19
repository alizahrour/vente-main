package com.telecom.crm.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RecentSaleResponse(
        Long saleId,
        String saleNumber,
        String customerName,
        String agentName,
        BigDecimal totalAmount,
        String status,
        LocalDateTime createdAt
) {
}
