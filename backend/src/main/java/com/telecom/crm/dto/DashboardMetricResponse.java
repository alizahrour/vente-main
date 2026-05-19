package com.telecom.crm.dto;

import java.math.BigDecimal;

public record DashboardMetricResponse(
        String label,
        BigDecimal value
) {
}
