package com.telecom.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.telecom.crm.dto.PaymentRequest;
import com.telecom.crm.dto.SaleItemRequest;
import com.telecom.crm.dto.SaleRequest;
import com.telecom.crm.entity.Customer;
import com.telecom.crm.entity.Invoice;
import com.telecom.crm.entity.Offer;
import com.telecom.crm.entity.OfferCategory;
import com.telecom.crm.entity.PaymentMethod;
import com.telecom.crm.entity.Role;
import com.telecom.crm.entity.Sale;
import com.telecom.crm.entity.SaleItem;
import com.telecom.crm.entity.SaleStatus;
import com.telecom.crm.entity.User;
import com.telecom.crm.exception.BadRequestException;
import com.telecom.crm.mapper.PaymentMapper;
import com.telecom.crm.mapper.SaleMapper;
import com.telecom.crm.repository.OfferRepository;
import com.telecom.crm.repository.SaleRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private CustomerService customerService;

    @Mock
    private UserContextService userContextService;

    @Mock
    private InvoiceService invoiceService;

    private SaleService saleService;

    @BeforeEach
    void setUp() {
        saleService = new SaleService(
                saleRepository,
                offerRepository,
                customerService,
                userContextService,
                invoiceService,
                new SaleMapper(),
                new PaymentMapper()
        );
    }

    @Test
    void createSaleShouldCreateDraftForExistingCustomer() {
        when(customerService.findCustomerEntity(1L)).thenReturn(customer());
        when(userContextService.getCurrentUser()).thenReturn(agent());
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = saleService.createSale(new SaleRequest(1L, null));

        assertThat(response.status()).isEqualTo("DRAFT");
        assertThat(response.customerId()).isEqualTo(1L);
        assertThat(response.customerName()).isEqualTo("Sara Bennani");
        assertThat(response.totalAmount()).isEqualByComparingTo("0.00");
        assertThat(response.items()).isEmpty();
    }

    @Test
    void addSaleItemShouldAddOfferToCartAndCalculateTotal() {
        Sale sale = draftSale();
        Offer offer = offer(10L, "FIBRE-100", "Fibre 100M", "199.00");

        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));
        when(offerRepository.findById(10L)).thenReturn(Optional.of(offer));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = saleService.addSaleItem(1L, new SaleItemRequest(10L, 2));

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).offerName()).isEqualTo("Fibre 100M");
        assertThat(response.items().get(0).quantity()).isEqualTo(2);
        assertThat(response.items().get(0).totalPrice()).isEqualByComparingTo("398.00");
        assertThat(response.totalAmount()).isEqualByComparingTo("398.00");
    }

    @Test
    void validateSaleShouldRejectEmptyDraft() {
        Sale sale = draftSale();
        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));

        assertThatThrownBy(() -> saleService.validateSale(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("au moins une offre");
    }

    @Test
    void validateSaleShouldValidateDraftWithItems() {
        Sale sale = draftSale();
        sale.getItems().add(item(sale, offer(10L, "MOB-10", "Mobile 10Go", "99.00"), 1));
        sale.recalculateTotalAmount();

        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = saleService.validateSale(1L);

        assertThat(response.status()).isEqualTo("VALIDATED");
        assertThat(response.validatedAt()).isNotNull();
        assertThat(response.totalAmount()).isEqualByComparingTo("99.00");
    }

    @Test
    void updateSaleShouldRejectValidatedSale() {
        Sale sale = draftSale();
        sale.setStatus(SaleStatus.VALIDATED);
        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));

        assertThatThrownBy(() -> saleService.updateSale(1L, new SaleRequest(1L, List.of(new SaleItemRequest(10L, 1)))))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ne peut plus etre modifiee");
    }

    @Test
    void paySaleShouldRecordSimulatedPaymentWithCorrectAmount() {
        Sale sale = validatedSale("250.00");
        Invoice invoice = Invoice.builder()
                .invoiceNumber("INV-001")
                .sale(sale)
                .totalAmount(new BigDecimal("250.00"))
                .generatedAt(LocalDateTime.now())
                .build();

        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));
        when(invoiceService.createInvoiceEntityForPaidSale(sale)).thenReturn(invoice);
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = saleService.paySale(1L, new PaymentRequest(new BigDecimal("250.00"), PaymentMethod.CARD));

        assertThat(response.status()).isEqualTo("PAID");
        assertThat(response.amount()).isEqualByComparingTo("250.00");
        assertThat(response.method()).isEqualTo("CARD");
        assertThat(response.reference()).startsWith("PAY-");
        assertThat(response.invoiceNumber()).isEqualTo("INV-001");
        assertThat(sale.getStatus()).isEqualTo(SaleStatus.PAID);
    }

    @Test
    void paySaleShouldRejectIncorrectAmount() {
        Sale sale = validatedSale("250.00");
        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));

        assertThatThrownBy(() -> saleService.paySale(1L, new PaymentRequest(new BigDecimal("200.00"), PaymentMethod.CASH)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("montant paye");
    }

    private Sale draftSale() {
        return Sale.builder()
                .id(1L)
                .saleNumber("SALE-001")
                .customer(customer())
                .agent(agent())
                .status(SaleStatus.DRAFT)
                .build();
    }

    private Sale validatedSale(String totalAmount) {
        Sale sale = draftSale();
        sale.setStatus(SaleStatus.VALIDATED);
        sale.setTotalAmount(new BigDecimal(totalAmount));
        return sale;
    }

    private SaleItem item(Sale sale, Offer offer, int quantity) {
        BigDecimal unitPrice = offer.getPrice();
        return SaleItem.builder()
                .id(1L)
                .sale(sale)
                .offer(offer)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .totalPrice(unitPrice.multiply(BigDecimal.valueOf(quantity)))
                .build();
    }

    private Customer customer() {
        return Customer.builder()
                .id(1L)
                .firstName("Sara")
                .lastName("Bennani")
                .cin("CIN123")
                .phone("0600000000")
                .build();
    }

    private User agent() {
        return User.builder()
                .id(2L)
                .username("agent")
                .fullName("Agent Telecom")
                .password("pwd")
                .role(Role.builder().id(1L).name(Role.AGENT).build())
                .build();
    }

    private Offer offer(Long id, String code, String name, String price) {
        return Offer.builder()
                .id(id)
                .code(code)
                .name(name)
                .category(OfferCategory.MOBILE)
                .price(new BigDecimal(price))
                .duration(30)
                .active(true)
                .build();
    }
}
