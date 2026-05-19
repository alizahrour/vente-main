package com.telecom.crm.dto;

import java.math.BigDecimal;

public record SaleItemResponse(
        Long id,
        Long offerId,
        String offerCode,
        String offerName,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal totalPrice
) {
}
