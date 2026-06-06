package com.telecom.crm.dto;

public record OfferImportResponse(
        int importedSingles,
        int importedBundles,
        int updatedOffers,
        int skippedRows
) {
}
