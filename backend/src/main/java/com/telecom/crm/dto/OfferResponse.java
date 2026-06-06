package com.telecom.crm.dto;

import com.telecom.crm.entity.OfferCategory;
import java.math.BigDecimal;

public record OfferResponse(
        Long id,
        String code,
        String existingCode,
        String name,
        OfferCategory category,
        String description,
        String productTypeCode,
        String productTypeDescription,
        String brand,
        String balance,
        String hierarchyCode,
        BigDecimal price,
        Integer duration,
        boolean eligibleForNormalCustomer,
        boolean bundle,
        boolean active
) {
}
