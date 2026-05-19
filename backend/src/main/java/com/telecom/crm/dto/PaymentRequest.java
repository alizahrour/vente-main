package com.telecom.crm.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import com.telecom.crm.entity.PaymentMethod;
import java.math.BigDecimal;

public record PaymentRequest(
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotNull PaymentMethod method
) {
}
