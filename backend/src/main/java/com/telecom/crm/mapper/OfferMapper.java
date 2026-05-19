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
                offer.getName(),
                offer.getCategory(),
                offer.getDescription(),
                offer.getPrice(),
                offer.getDuration(),
                offer.isActive()
        );
    }
}
