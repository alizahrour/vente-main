package com.telecom.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.telecom.crm.entity.Customer;
import com.telecom.crm.entity.Payment;
import com.telecom.crm.entity.PaymentMethod;
import com.telecom.crm.entity.PaymentStatus;
import com.telecom.crm.entity.Role;
import com.telecom.crm.entity.Sale;
import com.telecom.crm.entity.SaleStatus;
import com.telecom.crm.entity.User;
import com.telecom.crm.mapper.PaymentMapper;
import com.telecom.crm.repository.PaymentRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(paymentRepository, new PaymentMapper());
    }

    @Test
    void getPaymentsShouldReturnSimulatedPaidPayments() {
        Sale sale = Sale.builder()
                .id(1L)
                .saleNumber("SALE-001")
                .customer(customer())
                .agent(agent())
                .status(SaleStatus.PAID)
                .totalAmount(new BigDecimal("199.00"))
                .build();
        Payment payment = Payment.builder()
                .id(5L)
                .sale(sale)
                .amount(new BigDecimal("199.00"))
                .method(PaymentMethod.CARD)
                .status(PaymentStatus.PAID)
                .paidAt(LocalDateTime.now())
                .reference("PAY-001")
                .build();

        when(paymentRepository.findAll()).thenReturn(List.of(payment));

        var responses = paymentService.getPayments();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).status()).isEqualTo("PAID");
        assertThat(responses.get(0).amount()).isEqualByComparingTo("199.00");
        assertThat(responses.get(0).reference()).isEqualTo("PAY-001");
    }

    private Customer customer() {
        return Customer.builder().id(1L).firstName("Sara").lastName("Bennani").cin("CIN123").phone("0600000000").build();
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
