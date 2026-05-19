package com.telecom.crm.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        long totalCustomers,
        long totalOffers,
        long totalSales,
        long draftSales,
        long validatedSales,
        long paidSales,
        long cancelledSales,
        BigDecimal totalRevenue,
        List<RecentSaleResponse> recentSales
) {
}
