package com.telecom.crm.mapper;

import com.telecom.crm.dto.OfferResponse;
import com.telecom.crm.entity.Offer;
import org.springframework.stereotype.Component;

@Component
public class OfferMapper {

    public OfferResponse toResponse(Offer offer) {
        return new OfferResponse(
                offer.getId(),
                offer.getCode(),
                offer.getExistingCode(),
                offer.getName(),
                offer.getCategory(),
                offer.getDescription(),
                offer.getProductTypeCode(),
                offer.getProductTypeDescription(),
                offer.getBrand(),
                offer.getBalance(),
                offer.getHierarchyCode(),
                offer.getPrice(),
                offer.getDuration(),
                Boolean.TRUE.equals(offer.getEligibleForNormalCustomer()),
                Boolean.TRUE.equals(offer.getBundle()),
                offer.isActive()
        );
    }
}
