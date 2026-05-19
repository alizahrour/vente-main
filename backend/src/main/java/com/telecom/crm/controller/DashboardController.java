package com.telecom.crm.controller;

import com.telecom.crm.dto.DashboardMetricResponse;
import com.telecom.crm.dto.DashboardResponse;
import com.telecom.crm.service.DashboardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AGENT', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<DashboardResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    @GetMapping("/sales-by-offer")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<List<DashboardMetricResponse>> getSalesByOffer() {
        return ResponseEntity.ok(dashboardService.getSalesByOffer());
    }

    @GetMapping("/sales-by-agent")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<List<DashboardMetricResponse>> getSalesByAgent() {
        return ResponseEntity.ok(dashboardService.getSalesByAgent());
    }

    @GetMapping("/revenue-by-month")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<List<DashboardMetricResponse>> getRevenueByMonth() {
        return ResponseEntity.ok(dashboardService.getRevenueByMonth());
    }
}
