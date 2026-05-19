package com.telecom.crm.service;

import com.telecom.crm.dto.OfferRequest;
import com.telecom.crm.dto.OfferResponse;
import com.telecom.crm.entity.Offer;
import com.telecom.crm.exception.ConflictException;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.mapper.OfferMapper;
import com.telecom.crm.repository.OfferRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final OfferMapper offerMapper;

    public OfferService(OfferRepository offerRepository, OfferMapper offerMapper) {
        this.offerRepository = offerRepository;
        this.offerMapper = offerMapper;
    }

    public List<OfferResponse> getAllOffers(boolean activeOnly) {
        List<Offer> offers = activeOnly
                ? offerRepository.findByActiveTrueOrderByNameAsc()
                : offerRepository.findAllByOrderByNameAsc();
        return offers.stream().map(offerMapper::toResponse).toList();
    }

    public OfferResponse getOffer(Long id) {
        return offerMapper.toResponse(findOfferEntity(id));
    }

    public List<OfferResponse> getActiveOffers() {
        return getAllOffers(true);
    }

    @Transactional
    public OfferResponse createOffer(OfferRequest request) {
        validateCode(request.code(), null);

        Offer offer = Offer.builder()
                .code(request.code())
                .name(request.name())
                .category(request.category())
                .description(request.description())
                .price(request.price())
                .duration(request.duration())
                .active(request.active())
                .build();

        return offerMapper.toResponse(offerRepository.save(offer));
    }

    @Transactional
    public OfferResponse updateOffer(Long id, OfferRequest request) {
        Offer offer = findOfferEntity(id);
        validateCode(request.code(), id);

        offer.setCode(request.code());
        offer.setName(request.name());
        offer.setCategory(request.category());
        offer.setDescription(request.description());
        offer.setPrice(request.price());
        offer.setDuration(request.duration());
        offer.setActive(request.active());

        return offerMapper.toResponse(offerRepository.save(offer));
    }

    public Offer findOfferEntity(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Offre introuvable."));
    }

    @Transactional
    public OfferResponse activateOffer(Long id) {
        Offer offer = findOfferEntity(id);
        offer.setActive(true);
        return offerMapper.toResponse(offerRepository.save(offer));
    }

    @Transactional
    public OfferResponse deactivateOffer(Long id) {
        Offer offer = findOfferEntity(id);
        offer.setActive(false);
        return offerMapper.toResponse(offerRepository.save(offer));
    }

    private void validateCode(String code, Long id) {
        boolean exists = id == null
                ? offerRepository.existsByCode(code)
                : offerRepository.existsByCodeAndIdNot(code, id);
        if (exists) {
            throw new ConflictException("Le code offre existe deja.");
        }
    }
}
