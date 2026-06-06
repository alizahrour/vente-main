package com.telecom.crm.mapper;

import com.telecom.crm.dto.QuoteItemResponse;
import com.telecom.crm.dto.QuoteResponse;
import com.telecom.crm.entity.Quote;
import com.telecom.crm.entity.QuoteItem;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class QuoteMapper {

    public QuoteResponse toResponse(Quote quote) {
        List<QuoteItemResponse> itemResponses = quote.getItems()
                .stream()
                .sorted(Comparator.comparing(QuoteItem::getId, Comparator.nullsLast(Long::compareTo)))
                .map(this::toItemResponse)
                .toList();

        return new QuoteResponse(
                quote.getId(),
                quote.getQuoteNumber(),
                quote.getCustomer() != null ? quote.getCustomer().getId() : null,
                quote.getCustomerNameSnapshot(),
                quote.getCustomerContactSnapshot(),
                quote.getBillingAccount(),
                quote.getOrderSegment().name(),
                quote.getNetworkType().name(),
                quote.getCustomerType().name(),
                quote.getPaymentType().name(),
                quote.getCreditDuration().name(),
                quote.getQuoteExpirationDate(),
                quote.getOrderStartType().name(),
                quote.getDescription(),
                quote.getStatus().name(),
                quote.getTotalAmount(),
                quote.getCreatedAt(),
                quote.getUpdatedAt(),
                itemResponses
        );
    }

    private QuoteItemResponse toItemResponse(QuoteItem item) {
        return new QuoteItemResponse(
                item.getId(),
                item.getOffer().getId(),
                item.getOffer().getCode(),
                item.getOffer().getName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getTotalPrice()
        );
    }
}
