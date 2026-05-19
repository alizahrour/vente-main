package com.telecom.crm.service;

import com.telecom.crm.dto.CancelSaleRequest;
import com.telecom.crm.dto.InvoiceResponse;
import com.telecom.crm.dto.PaymentRequest;
import com.telecom.crm.dto.PaymentResponse;
import com.telecom.crm.dto.SaleItemRequest;
import com.telecom.crm.dto.SaleRequest;
import com.telecom.crm.dto.SaleResponse;
import com.telecom.crm.entity.Customer;
import com.telecom.crm.entity.Invoice;
import com.telecom.crm.entity.Offer;
import com.telecom.crm.entity.Payment;
import com.telecom.crm.entity.PaymentStatus;
import com.telecom.crm.entity.Sale;
import com.telecom.crm.entity.SaleItem;
import com.telecom.crm.entity.SaleStatus;
import com.telecom.crm.exception.BadRequestException;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.mapper.PaymentMapper;
import com.telecom.crm.mapper.SaleMapper;
import com.telecom.crm.repository.OfferRepository;
import com.telecom.crm.repository.SaleRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final OfferRepository offerRepository;
    private final CustomerService customerService;
    private final UserContextService userContextService;
    private final InvoiceService invoiceService;
    private final SaleMapper saleMapper;
    private final PaymentMapper paymentMapper;

    public SaleService(
            SaleRepository saleRepository,
            OfferRepository offerRepository,
            CustomerService customerService,
            UserContextService userContextService,
            InvoiceService invoiceService,
            SaleMapper saleMapper,
            PaymentMapper paymentMapper
    ) {
        this.saleRepository = saleRepository;
        this.offerRepository = offerRepository;
        this.customerService = customerService;
        this.userContextService = userContextService;
        this.invoiceService = invoiceService;
        this.saleMapper = saleMapper;
        this.paymentMapper = paymentMapper;
    }

    public List<SaleResponse> getSalesHistory() {
        return saleRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(saleMapper::toResponse)
                .toList();
    }

    public SaleResponse getSale(Long id) {
        return saleMapper.toResponse(findSale(id));
    }

    @Transactional
    public SaleResponse createSale(SaleRequest request) {
        assertCustomerProvided(request.customerId());
        Customer customer = customerService.findCustomerEntity(request.customerId());
        Sale sale = Sale.builder()
                .saleNumber(generateReference("SALE"))
                .customer(customer)
                .agent(userContextService.getCurrentUser())
                .status(SaleStatus.DRAFT)
                .build();

        if (request.items() != null && !request.items().isEmpty()) {
            applySaleItems(sale, request.items());
        }
        return saleMapper.toResponse(saleRepository.save(sale));
    }

    @Transactional
    public SaleResponse updateSale(Long id, SaleRequest request) {
        Sale sale = findSale(id);
        assertSaleCanBeModified(sale);
        assertCustomerProvided(request.customerId());

        Customer customer = customerService.findCustomerEntity(request.customerId());
        sale.setCustomer(customer);
        if (request.items() != null) {
            applySaleItems(sale, request.items());
        }

        return saleMapper.toResponse(saleRepository.save(sale));
    }

    @Transactional
    public SaleResponse addSaleItem(Long id, SaleItemRequest request) {
        Sale sale = findSale(id);
        assertSaleCanBeModified(sale);

        boolean exists = sale.getItems().stream()
                .anyMatch(item -> item.getOffer().getId().equals(request.offerId()));
        if (exists) {
            throw new BadRequestException("Cette offre existe deja dans la vente.");
        }

        SaleItem item = buildSaleItem(request);
        item.setSale(sale);
        sale.getItems().add(item);
        sale.recalculateTotalAmount();

        return saleMapper.toResponse(saleRepository.save(sale));
    }

    @Transactional
    public SaleResponse updateSaleItem(Long id, Long itemId, SaleItemRequest request) {
        Sale sale = findSale(id);
        assertSaleCanBeModified(sale);

        SaleItem item = findSaleItem(sale, itemId);
        if (!item.getOffer().getId().equals(request.offerId())) {
            boolean exists = sale.getItems().stream()
                    .anyMatch(existing -> existing.getOffer().getId().equals(request.offerId()));
            if (exists) {
                throw new BadRequestException("Cette offre existe deja dans la vente.");
            }
            Offer offer = findActiveOffer(request.offerId());
            item.setOffer(offer);
            item.setUnitPrice(offer.getPrice().setScale(2, RoundingMode.HALF_UP));
        }

        item.setQuantity(request.quantity());
        item.setTotalPrice(item.getUnitPrice()
                .multiply(BigDecimal.valueOf(request.quantity()))
                .setScale(2, RoundingMode.HALF_UP));
        sale.recalculateTotalAmount();

        return saleMapper.toResponse(saleRepository.save(sale));
    }

    @Transactional
    public SaleResponse deleteSaleItem(Long id, Long itemId) {
        Sale sale = findSale(id);
        assertSaleCanBeModified(sale);
        SaleItem item = findSaleItem(sale, itemId);

        sale.getItems().remove(item);
        sale.recalculateTotalAmount();

        return saleMapper.toResponse(saleRepository.save(sale));
    }

    @Transactional
    public SaleResponse validateSale(Long id) {
        Sale sale = findSale(id);
        if (sale.getStatus() != SaleStatus.DRAFT) {
            throw new BadRequestException("Seule une vente au statut DRAFT peut etre validee.");
        }
        if (sale.getItems().isEmpty()) {
            throw new BadRequestException("Validation impossible: la vente doit contenir au moins une offre.");
        }

        sale.setStatus(SaleStatus.VALIDATED);
        sale.setValidatedAt(LocalDateTime.now());
        return saleMapper.toResponse(saleRepository.save(sale));
    }

    @Transactional
    public SaleResponse cancelSale(Long id, CancelSaleRequest request) {
        Sale sale = findSale(id);
        if (sale.getStatus() == SaleStatus.CANCELLED) {
            throw new BadRequestException("La vente est deja annulee.");
        }
        if (sale.getStatus() == SaleStatus.PAID) {
            throw new BadRequestException("Une vente payee ne peut pas etre annulee.");
        }
        if (sale.getStatus() != SaleStatus.DRAFT && sale.getStatus() != SaleStatus.VALIDATED) {
            throw new BadRequestException("Seules les ventes DRAFT ou VALIDATED peuvent etre annulees.");
        }

        sale.setStatus(SaleStatus.CANCELLED);
        sale.setCancellationReason(request.reason());
        return saleMapper.toResponse(saleRepository.save(sale));
    }

    @Transactional
    public PaymentResponse paySale(Long id, PaymentRequest request) {
        Sale sale = findSale(id);
        if (sale.getStatus() != SaleStatus.VALIDATED) {
            throw new BadRequestException("Le paiement n'est autorise qu'apres validation de la vente.");
        }
        if (sale.isPaid()) {
            throw new BadRequestException("La vente est deja payee.");
        }
        if (sale.getTotalAmount().compareTo(request.amount()) != 0) {
            throw new BadRequestException("Le montant paye doit correspondre exactement au montant total.");
        }

        Payment payment = Payment.builder()
                .sale(sale)
                .method(request.method())
                .amount(request.amount().setScale(2, RoundingMode.HALF_UP))
                .status(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                .reference(generateReference("PAY"))
                .build();

        sale.setPayment(payment);
        sale.setStatus(SaleStatus.PAID);
        Invoice invoice = invoiceService.createInvoiceEntityForPaidSale(sale);
        sale.setInvoice(invoice);
        Sale savedSale = saleRepository.save(sale);

        return paymentMapper.toResponse(savedSale.getPayment());
    }

    @Transactional
    public InvoiceResponse createInvoice(Long saleId) {
        return invoiceService.generateInvoice(saleId);
    }

    public InvoiceResponse getInvoice(Long saleId) {
        return invoiceService.getInvoiceBySale(saleId);
    }

    public Sale findSale(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vente introuvable."));
    }

    private void assertSaleCanBeModified(Sale sale) {
        if (sale.getStatus() == SaleStatus.VALIDATED) {
            throw new BadRequestException("Modification interdite: une vente VALIDATED ne peut plus etre modifiee.");
        }
        if (sale.getStatus() == SaleStatus.PAID) {
            throw new BadRequestException("Modification interdite: une vente PAID ne peut plus etre modifiee.");
        }
        if (sale.getStatus() == SaleStatus.CANCELLED) {
            throw new BadRequestException("Modification interdite: une vente CANCELLED ne peut plus etre modifiee.");
        }
    }

    private void assertCustomerProvided(Long customerId) {
        if (customerId == null) {
            throw new BadRequestException("Operation impossible: un client existant est obligatoire.");
        }
    }

    private void applySaleItems(Sale sale, List<SaleItemRequest> itemRequests) {
        if (itemRequests == null) {
            return;
        }
        if (itemRequests.isEmpty()) {
            sale.replaceItems(List.of());
            return;
        }

        Map<Long, SaleItemRequest> deduplicated = new HashMap<>();
        for (SaleItemRequest itemRequest : itemRequests) {
            if (deduplicated.putIfAbsent(itemRequest.offerId(), itemRequest) != null) {
                throw new BadRequestException("Chaque offre doit apparaitre une seule fois dans le panier.");
            }
        }

        List<Long> offerIds = itemRequests.stream().map(SaleItemRequest::offerId).toList();
        Map<Long, Offer> offersById = offerRepository.findByIdIn(offerIds)
                .stream()
                .collect(HashMap::new, (map, offer) -> map.put(offer.getId(), offer), HashMap::putAll);

        if (offersById.size() != offerIds.size()) {
            throw new BadRequestException("Au moins une offre est introuvable.");
        }

        List<SaleItem> items = itemRequests.stream().map(itemRequest -> {
            Offer offer = offersById.get(itemRequest.offerId());
            return buildSaleItem(itemRequest, offer);
        }).toList();

        sale.replaceItems(items);
    }

    private SaleItem buildSaleItem(SaleItemRequest itemRequest) {
        return buildSaleItem(itemRequest, findActiveOffer(itemRequest.offerId()));
    }

    private SaleItem buildSaleItem(SaleItemRequest itemRequest, Offer offer) {
        if (!offer.isActive()) {
            throw new BadRequestException("Une offre inactive ne peut pas etre vendue.");
        }
        BigDecimal unitPrice = offer.getPrice().setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPrice = unitPrice
                .multiply(BigDecimal.valueOf(itemRequest.quantity()))
                .setScale(2, RoundingMode.HALF_UP);

        return SaleItem.builder()
                .offer(offer)
                .quantity(itemRequest.quantity())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .build();
    }

    private Offer findActiveOffer(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("Offre introuvable."));
        if (!offer.isActive()) {
            throw new BadRequestException("Une offre inactive ne peut pas etre vendue.");
        }
        return offer;
    }

    private SaleItem findSaleItem(Sale sale, Long itemId) {
        return sale.getItems()
                .stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Ligne de vente introuvable."));
    }

    private String generateReference(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
