package com.telecom.crm.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SaleRequest(
        @NotNull Long customerId,
        @Valid List<SaleItemRequest> items
) {
}
