package com.telecom.crm.service;

import com.telecom.crm.dto.OfferRequest;
import com.telecom.crm.dto.OfferImportResponse;
import com.telecom.crm.dto.OfferResponse;
import com.telecom.crm.entity.Offer;
import com.telecom.crm.entity.OfferCategory;
import com.telecom.crm.entity.Quote;
import com.telecom.crm.entity.QuoteCustomerType;
import com.telecom.crm.entity.QuoteStatus;
import com.telecom.crm.exception.BadRequestException;
import com.telecom.crm.exception.ConflictException;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.mapper.OfferMapper;
import com.telecom.crm.repository.OfferRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final OfferMapper offerMapper;
    private final QuoteService quoteService;
    private final OfferExcelImportService offerExcelImportService;

    public OfferService(
            OfferRepository offerRepository,
            OfferMapper offerMapper,
            QuoteService quoteService,
            OfferExcelImportService offerExcelImportService
    ) {
        this.offerRepository = offerRepository;
        this.offerMapper = offerMapper;
        this.quoteService = quoteService;
        this.offerExcelImportService = offerExcelImportService;
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
                .productTypeDescription(request.description())
                .hierarchyCode(request.category().name())
                .price(request.price())
                .duration(request.duration())
                .eligibleForNormalCustomer(true)
                .bundle(false)
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
        offer.setProductTypeDescription(request.description());
        offer.setHierarchyCode(request.category().name());
        offer.setPrice(request.price());
        offer.setDuration(request.duration());
        if (offer.getEligibleForNormalCustomer() == null) {
            offer.setEligibleForNormalCustomer(true);
        }
        if (offer.getBundle() == null) {
            offer.setBundle(false);
        }
        offer.setActive(request.active());

        return offerMapper.toResponse(offerRepository.save(offer));
    }

    public Page<OfferResponse> getEligibleOffers(
            Long quoteId,
            int page,
            int size,
            String search,
            String hierarchyCode,
            String productTypeCode,
            Boolean bundle
    ) {
        Quote quote = quoteService.findQuote(quoteId);
        if (quote.getStatus() != QuoteStatus.DRAFT) {
            throw new BadRequestException("Le catalogue n'est disponible que pour un devis en brouillon.");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Specification<Offer> specification = Specification.where(activeOffers())
                .and(excludeDeliveryFees());

        if (quote.getCustomerType() == QuoteCustomerType.INDIVIDUAL || quote.getCustomerType() == QuoteCustomerType.ANONYMOUS) {
            specification = specification.and(normalCustomerEligibility());
        }
        if (StringUtils.hasText(search)) {
            specification = specification.and(matchesSearch(search));
        }
        if (StringUtils.hasText(hierarchyCode)) {
            specification = specification.and(matchesCategoryToken(hierarchyCode));
        }
        if (StringUtils.hasText(productTypeCode)) {
            specification = specification.and(matchesProductType(productTypeCode));
        }
        if (bundle != null) {
            specification = specification.and(matchesBundle(bundle));
        }

        return offerRepository.findAll(specification, pageable).map(offerMapper::toResponse);
    }

    @Transactional
    public OfferImportResponse importOffersFromExcel() {
        return offerExcelImportService.importFromClasspath();
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

    private Specification<Offer> activeOffers() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    private Specification<Offer> normalCustomerEligibility() {
        return (root, query, cb) -> cb.isTrue(root.get("eligibleForNormalCustomer"));
    }

    private Specification<Offer> excludeDeliveryFees() {
        return (root, query, cb) -> cb.and(
                cb.notLike(cb.lower(cb.coalesce(root.get("name"), "")), "%frais de livraison%"),
                cb.notLike(cb.lower(cb.coalesce(root.get("productTypeDescription"), "")), "%frais de livraison%")
        );
    }

    private Specification<Offer> matchesSearch(String rawSearch) {
        String search = wrapLike(rawSearch);
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(cb.coalesce(root.get("name"), "")), search),
                cb.like(cb.lower(cb.coalesce(root.get("code"), "")), search)
        );
    }

    private Specification<Offer> matchesProductType(String rawProductTypeCode) {
        String productType = wrapLike(rawProductTypeCode);
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(cb.coalesce(root.get("productTypeCode"), "")), productType),
                cb.like(cb.lower(cb.coalesce(root.get("productTypeDescription"), "")), productType)
        );
    }

    private Specification<Offer> matchesBundle(boolean bundle) {
        return (root, query, cb) -> bundle
                ? cb.isTrue(root.get("bundle"))
                : cb.or(cb.isFalse(root.get("bundle")), cb.isNull(root.get("bundle")));
    }

    private Specification<Offer> matchesCategoryToken(String rawCategoryToken) {
        String token = wrapLike(rawCategoryToken);
        String normalized = normalize(rawCategoryToken);

        return (root, query, cb) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();

            OfferCategory category = mapCatalogCategory(rawCategoryToken);
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            predicates.add(cb.like(cb.lower(cb.coalesce(root.get("hierarchyCode"), "")), token));
            predicates.add(cb.like(cb.lower(cb.coalesce(root.get("productTypeCode"), "")), token));
            predicates.add(cb.like(cb.lower(cb.coalesce(root.get("productTypeDescription"), "")), token));
            predicates.add(cb.like(cb.lower(cb.coalesce(root.get("name"), "")), token));

            if (normalized.contains("bundle")) {
                predicates.add(cb.isTrue(root.get("bundle")));
            }
            if (normalized.contains("poste seul")) {
                predicates.add(cb.or(cb.isFalse(root.get("bundle")), cb.isNull(root.get("bundle"))));
            }

            return cb.or(predicates.toArray(Predicate[]::new));
        };
    }

    private OfferCategory mapCatalogCategory(String categoryToken) {
        String normalized = normalize(categoryToken);
        if (normalized.contains("fixe") || normalized.contains("fibre")) {
            return OfferCategory.FIBRE;
        }
        if (normalized.contains("recharge")) {
            return OfferCategory.RECHARGE;
        }
        if (normalized.contains("pack")) {
            return OfferCategory.BOX;
        }
        if (normalized.contains("service")) {
            return OfferCategory.INTERNET;
        }
        if (normalized.contains("mobile") || normalized.contains("poste") || normalized.contains("accessoire")
                || normalized.contains("carte") || normalized.contains("pochette")) {
            return OfferCategory.MOBILE;
        }
        return null;
    }

    private String wrapLike(String value) {
        return "%" + normalize(value) + "%";
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }
}
