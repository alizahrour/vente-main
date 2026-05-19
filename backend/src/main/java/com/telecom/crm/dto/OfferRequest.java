package com.telecom.crm.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.telecom.crm.entity.OfferCategory;
import java.math.BigDecimal;

public record OfferRequest(
        @NotBlank @Size(max = 40) String code,
        @NotBlank @Size(max = 120) String name,
        @NotNull OfferCategory category,
        @Size(max = 255) String description,
        @NotNull @DecimalMin(value = "0.01") BigDecimal price,
        @NotNull @Min(1) Integer duration,
        boolean active
) {
}
