package com.telecom.crm.dto;

import com.telecom.crm.entity.QuoteCreditDuration;
import com.telecom.crm.entity.QuoteNetworkType;
import com.telecom.crm.entity.QuoteOrderSegment;
import com.telecom.crm.entity.QuoteOrderStartType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateQuoteRequest(
        @NotNull Long customerId,
        @Size(max = 120) String customerContact,
        @NotBlank @Size(max = 80) String billingAccount,
        @NotNull QuoteOrderSegment orderSegment,
        @NotNull QuoteNetworkType networkType,
        QuoteCreditDuration creditDuration,
        @NotNull LocalDate quoteExpirationDate,
        @NotNull QuoteOrderStartType orderStartType,
        @Size(max = 500) String description
) {
}
