package com.telecom.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.telecom.crm.dto.OfferRequest;
import com.telecom.crm.entity.Offer;
import com.telecom.crm.entity.OfferCategory;
import com.telecom.crm.mapper.OfferMapper;
import com.telecom.crm.repository.OfferRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OfferServiceTest {

    @Mock
    private OfferRepository offerRepository;

    private OfferService offerService;

    @BeforeEach
    void setUp() {
        offerService = new OfferService(offerRepository, new OfferMapper());
    }

    @Test
    void createOfferShouldPersistValidOffer() {
        when(offerRepository.existsByCode("MOB-10")).thenReturn(false);
        when(offerRepository.save(any(Offer.class))).thenAnswer(invocation -> {
            Offer offer = invocation.getArgument(0);
            offer.setId(10L);
            return offer;
        });

        var response = offerService.createOffer(new OfferRequest(
                "MOB-10",
                "Mobile 10Go",
                OfferCategory.MOBILE,
                "Forfait mobile commercial",
                new BigDecimal("99.00"),
                30,
                true
        ));

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.code()).isEqualTo("MOB-10");
        assertThat(response.price()).isEqualByComparingTo("99.00");
        assertThat(response.active()).isTrue();
    }
}
