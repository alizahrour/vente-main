package com.telecom.crm.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SaleItemRequest(
        @NotNull Long offerId,
        @NotNull @Min(1) Integer quantity
) {
}
