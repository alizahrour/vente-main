package com.telecom.crm.dto;

import com.telecom.crm.entity.OfferCategory;
import java.math.BigDecimal;

public record OfferResponse(
        Long id,
        String code,
        String name,
        OfferCategory category,
        String description,
        BigDecimal price,
        Integer duration,
        boolean active
) {
}
