package com.telecom.crm.controller;

import com.telecom.crm.dto.CancelSaleRequest;
import com.telecom.crm.dto.InvoiceResponse;
import com.telecom.crm.dto.PaymentRequest;
import com.telecom.crm.dto.PaymentResponse;
import com.telecom.crm.dto.SaleItemRequest;
import com.telecom.crm.dto.SaleRequest;
import com.telecom.crm.dto.SaleResponse;
import com.telecom.crm.service.SaleService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
@SecurityRequirement(name = "bearerAuth")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AGENT', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<List<SaleResponse>> getSales() {
        return ResponseEntity.ok(saleService.getSalesHistory());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'SUPERVISOR', 'ADMIN')")
    public ResponseEntity<SaleResponse> getSale(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSale(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SaleResponse> createSale(@Valid @RequestBody SaleRequest request) {
        return ResponseEntity.ok(saleService.createSale(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SaleResponse> updateSale(@PathVariable Long id, @Valid @RequestBody SaleRequest request) {
        return ResponseEntity.ok(saleService.updateSale(id, request));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SaleResponse> addSaleItem(@PathVariable Long id, @Valid @RequestBody SaleItemRequest request) {
        return ResponseEntity.ok(saleService.addSaleItem(id, request));
    }

    @PutMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SaleResponse> updateSaleItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @Valid @RequestBody SaleItemRequest request
    ) {
        return ResponseEntity.ok(saleService.updateSaleItem(id, itemId, request));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SaleResponse> deleteSaleItem(@PathVariable Long id, @PathVariable Long itemId) {
        return ResponseEntity.ok(saleService.deleteSaleItem(id, itemId));
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SaleResponse> validateSale(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.validateSale(id));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SaleResponse> cancelSale(@PathVariable Long id, @Valid @RequestBody CancelSaleRequest request) {
        return ResponseEntity.ok(saleService.cancelSale(id, request));
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<PaymentResponse> paySaleSingular(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(saleService.paySale(id, request));
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<PaymentResponse> paySale(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(saleService.paySale(id, request));
    }

    @PostMapping("/{id}/invoice")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> createInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.createInvoice(id));
    }

    @GetMapping("/{id}/invoice")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getInvoice(id));
    }
}
