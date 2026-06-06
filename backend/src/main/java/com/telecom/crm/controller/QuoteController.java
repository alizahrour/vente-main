package com.telecom.crm.controller;

import com.telecom.crm.dto.CreateQuoteRequest;
import com.telecom.crm.dto.QuoteResponse;
import com.telecom.crm.service.QuoteService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quotes")
@SecurityRequirement(name = "bearerAuth")
public class QuoteController {

    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<QuoteResponse> createQuote(@Valid @RequestBody CreateQuoteRequest request) {
        return ResponseEntity.ok(quoteService.createQuote(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<QuoteResponse> getQuote(@PathVariable Long id) {
        return ResponseEntity.ok(quoteService.getQuote(id));
    }
}
