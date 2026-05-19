package com.telecom.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.telecom.crm.entity.Customer;
import com.telecom.crm.entity.Invoice;
import com.telecom.crm.entity.Offer;
import com.telecom.crm.entity.OfferCategory;
import com.telecom.crm.entity.Payment;
import com.telecom.crm.entity.PaymentMethod;
import com.telecom.crm.entity.PaymentStatus;
import com.telecom.crm.entity.Role;
import com.telecom.crm.entity.Sale;
import com.telecom.crm.entity.SaleItem;
import com.telecom.crm.entity.SaleStatus;
import com.telecom.crm.entity.User;
import com.telecom.crm.exception.BadRequestException;
import com.telecom.crm.mapper.InvoiceMapper;
import com.telecom.crm.mapper.SaleMapper;
import com.telecom.crm.repository.InvoiceRepository;
import com.telecom.crm.repository.SaleRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private SaleRepository saleRepository;

    private InvoiceService invoiceService;

    @BeforeEach
    void setUp() {
        invoiceService = new InvoiceService(
                invoiceRepository,
                saleRepository,
                new InvoiceMapper(new SaleMapper())
        );
    }

    @Test
    void generateInvoiceShouldRejectUnpaidSale() {
        Sale sale = baseSale(SaleStatus.VALIDATED);
        when(invoiceRepository.findBySaleId(1L)).thenReturn(Optional.empty());
        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));

        assertThatThrownBy(() -> invoiceService.generateInvoice(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("vente payee");
    }

    @Test
    void generateInvoiceShouldCreateInvoiceForPaidSale() {
        Sale sale = paidSale();
        when(invoiceRepository.findBySaleId(1L)).thenReturn(Optional.empty());
        when(saleRepository.findById(1L)).thenReturn(Optional.of(sale));
        when(invoiceRepository.existsByInvoiceNumber(any())).thenReturn(false);
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = invoiceService.generateInvoice(1L);

        assertThat(response.invoiceNumber()).startsWith("INV-");
        assertThat(response.saleNumber()).isEqualTo("SALE-001");
        assertThat(response.customerName()).isEqualTo("Sara Bennani");
        assertThat(response.agentName()).isEqualTo("Agent Telecom");
        assertThat(response.method()).isEqualTo("CARD");
        assertThat(response.paymentReference()).isEqualTo("PAY-001");
        assertThat(response.totalAmount()).isEqualByComparingTo("199.00");
        assertThat(response.items()).hasSize(1);
    }

    private Sale paidSale() {
        Sale sale = baseSale(SaleStatus.PAID);
        Payment payment = Payment.builder()
                .id(1L)
                .sale(sale)
                .amount(new BigDecimal("199.00"))
                .method(PaymentMethod.CARD)
                .status(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                .reference("PAY-001")
                .build();
        sale.setPayment(payment);
        return sale;
    }

    private Sale baseSale(SaleStatus status) {
        Sale sale = Sale.builder()
                .id(1L)
                .saleNumber("SALE-001")
                .customer(customer())
                .agent(agent())
                .status(status)
                .totalAmount(new BigDecimal("199.00"))
                .build();
        sale.getItems().add(item(sale));
        return sale;
    }

    private SaleItem item(Sale sale) {
        Offer offer = Offer.builder()
                .id(10L)
                .code("FIBRE-100")
                .name("Fibre 100M")
                .category(OfferCategory.BOX)
                .price(new BigDecimal("199.00"))
                .duration(30)
                .active(true)
                .build();
        return SaleItem.builder()
                .id(1L)
                .sale(sale)
                .offer(offer)
                .quantity(1)
                .unitPrice(new BigDecimal("199.00"))
                .totalPrice(new BigDecimal("199.00"))
                .build();
    }

    private Customer customer() {
        return Customer.builder()
                .id(1L)
                .firstName("Sara")
                .lastName("Bennani")
                .cin("CIN123")
                .phone("0600000000")
                .email("sara@example.com")
                .address("Rue 1")
                .city("Casablanca")
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
}
