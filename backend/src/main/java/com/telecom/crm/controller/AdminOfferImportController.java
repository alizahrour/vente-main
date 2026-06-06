package com.telecom.crm.controller;

import com.telecom.crm.dto.OfferImportResponse;
import com.telecom.crm.service.OfferExcelImportService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/offers")
@SecurityRequirement(name = "bearerAuth")
public class AdminOfferImportController {

    private final OfferExcelImportService offerExcelImportService;

    public AdminOfferImportController(OfferExcelImportService offerExcelImportService) {
        this.offerExcelImportService = offerExcelImportService;
    }

    @PostMapping("/import-excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OfferImportResponse> importExcel() {
        return ResponseEntity.ok(offerExcelImportService.importFromClasspath());
    }
}
