package com.telecom.crm.controller;

import com.telecom.crm.dto.InvoiceResponse;
import com.telecom.crm.service.InvoiceService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoices")
@SecurityRequirement(name = "bearerAuth")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<List<InvoiceResponse>> getInvoices() {
        return ResponseEntity.ok(invoiceService.getInvoices());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoice(id));
    }

    @GetMapping("/sale/{saleId}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> getInvoiceBySale(@PathVariable Long saleId) {
        return ResponseEntity.ok(invoiceService.getInvoiceBySale(saleId));
    }

    @PostMapping("/sale/{saleId}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> generateInvoice(@PathVariable Long saleId) {
        return ResponseEntity.ok(invoiceService.generateInvoice(saleId));
    }
}
