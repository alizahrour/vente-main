package com.telecom.crm.controller;

import com.telecom.crm.dto.OfferRequest;
import com.telecom.crm.dto.OfferResponse;
import com.telecom.crm.service.OfferService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/offers")
@SecurityRequirement(name = "bearerAuth")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<List<OfferResponse>> getOffers(
            @RequestParam(name = "activeOnly", defaultValue = "false") boolean activeOnly
    ) {
        return ResponseEntity.ok(offerService.getAllOffers(activeOnly));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<List<OfferResponse>> getActiveOffers() {
        return ResponseEntity.ok(offerService.getActiveOffers());
    }

    @GetMapping("/eligible")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Page<OfferResponse>> getEligibleOffers(
            @RequestParam Long quoteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String hierarchyCode,
            @RequestParam(required = false) String productTypeCode,
            @RequestParam(required = false) Boolean bundle
    ) {
        return ResponseEntity.ok(offerService.getEligibleOffers(
                quoteId,
                page,
                size,
                search,
                hierarchyCode,
                productTypeCode,
                bundle
        ));
    }

    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<OfferResponse> getOffer(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.getOffer(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OfferResponse> createOffer(@Valid @RequestBody OfferRequest request) {
        return ResponseEntity.ok(offerService.createOffer(request));
    }

    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OfferResponse> updateOffer(@PathVariable Long id, @Valid @RequestBody OfferRequest request) {
        return ResponseEntity.ok(offerService.updateOffer(id, request));
    }

    @PatchMapping("/{id:\\d+}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OfferResponse> activateOffer(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.activateOffer(id));
    }

    @PatchMapping("/{id:\\d+}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OfferResponse> deactivateOffer(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.deactivateOffer(id));
    }
}
