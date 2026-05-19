package com.telecom.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.telecom.crm.entity.Customer;
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
import com.telecom.crm.mapper.SaleMapper;
import com.telecom.crm.repository.CustomerRepository;
import com.telecom.crm.repository.OfferRepository;
import com.telecom.crm.repository.SaleRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private UserContextService userContextService;

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(
                customerRepository,
                offerRepository,
                saleRepository,
                userContextService,
                new SaleMapper()
        );
    }

    @Test
    void getDashboardShouldCalculatePaidSales() {
        User admin = user(9L, "admin", Role.ADMIN);
        Sale paidSale = sale(1L, SaleStatus.PAID, "199.00", user(2L, "agent", Role.AGENT));
        paidSale.setPayment(Payment.builder()
                .id(1L)
                .sale(paidSale)
                .amount(new BigDecimal("199.00"))
                .method(PaymentMethod.CARD)
                .status(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                .reference("PAY-001")
                .build());
        Sale cancelledSale = sale(2L, SaleStatus.CANCELLED, "99.00", user(3L, "agent2", Role.AGENT));

        when(userContextService.getCurrentUser()).thenReturn(admin);
        when(customerRepository.count()).thenReturn(2L);
        when(offerRepository.count()).thenReturn(3L);
        when(saleRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(paidSale, cancelledSale));

        var response = dashboardService.getDashboard();

        assertThat(response.totalSales()).isEqualTo(2);
        assertThat(response.paidSales()).isEqualTo(1);
        assertThat(response.cancelledSales()).isEqualTo(1);
        assertThat(response.totalRevenue()).isEqualByComparingTo("199.00");
        assertThat(response.recentSales()).hasSize(2);
    }

    @Test
    void getSalesByOfferShouldUseValidatedAndPaidSalesOnly() {
        User admin = user(9L, "admin", Role.ADMIN);
        Sale paidSale = sale(1L, SaleStatus.PAID, "199.00", user(2L, "agent", Role.AGENT));
        Sale cancelledSale = sale(2L, SaleStatus.CANCELLED, "199.00", user(2L, "agent", Role.AGENT));

        when(userContextService.getCurrentUser()).thenReturn(admin);
        when(saleRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(paidSale, cancelledSale));

        var metrics = dashboardService.getSalesByOffer();

        assertThat(metrics).hasSize(1);
        assertThat(metrics.get(0).label()).isEqualTo("Fibre 100M");
        assertThat(metrics.get(0).value()).isEqualByComparingTo("1");
    }

    private Sale sale(Long id, SaleStatus status, String totalAmount, User agent) {
        Sale sale = Sale.builder()
                .id(id)
                .saleNumber("SALE-00" + id)
                .customer(customer())
                .agent(agent)
                .status(status)
                .totalAmount(new BigDecimal(totalAmount))
                .build();
        sale.setCreatedAt(LocalDateTime.now());
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
        return Customer.builder().id(1L).firstName("Sara").lastName("Bennani").cin("CIN123").phone("0600000000").build();
    }

    private User user(Long id, String username, String roleName) {
        return User.builder()
                .id(id)
                .username(username)
                .fullName(username.toUpperCase())
                .password("pwd")
                .role(Role.builder().id(id).name(roleName).build())
                .build();
    }
}
