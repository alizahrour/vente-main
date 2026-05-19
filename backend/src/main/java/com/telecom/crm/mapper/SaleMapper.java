package com.telecom.crm.mapper;

import com.telecom.crm.dto.RecentSaleResponse;
import com.telecom.crm.dto.SaleItemResponse;
import com.telecom.crm.dto.SaleResponse;
import com.telecom.crm.entity.Sale;
import com.telecom.crm.entity.SaleItem;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class SaleMapper {

    public SaleResponse toResponse(Sale sale) {
        List<SaleItemResponse> itemResponses = sale.getItems()
                .stream()
                .sorted(Comparator.comparing(SaleItem::getId, Comparator.nullsLast(Long::compareTo)))
                .map(this::toItemResponse)
                .toList();

        return new SaleResponse(
                sale.getId(),
                sale.getSaleNumber(),
                sale.getCustomer().getId(),
                sale.getCustomer().getFullName(),
                sale.getCustomer().getPhone(),
                sale.getStatus().name(),
                sale.getCancellationReason(),
                sale.getTotalAmount(),
                sale.isPaid(),
                sale.getCreatedAt(),
                sale.getValidatedAt(),
                sale.getAgent().getFullName(),
                itemResponses
        );
    }

    public RecentSaleResponse toRecentSaleResponse(Sale sale) {
        return new RecentSaleResponse(
                sale.getId(),
                sale.getSaleNumber(),
                sale.getCustomer().getFullName(),
                sale.getAgent().getFullName(),
                sale.getTotalAmount(),
                sale.getStatus().name(),
                sale.getCreatedAt()
        );
    }

    private SaleItemResponse toItemResponse(SaleItem item) {
        return new SaleItemResponse(
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
