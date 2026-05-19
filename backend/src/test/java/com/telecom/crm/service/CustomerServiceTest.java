package com.telecom.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.telecom.crm.dto.CustomerRequest;
import com.telecom.crm.entity.Customer;
import com.telecom.crm.exception.ConflictException;
import com.telecom.crm.mapper.CustomerMapper;
import com.telecom.crm.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        customerService = new CustomerService(customerRepository, new CustomerMapper());
    }

    @Test
    void createCustomerShouldPersistValidCustomer() {
        when(customerRepository.existsByPhone("0600000000")).thenReturn(false);
        when(customerRepository.existsByCin("CIN123")).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer customer = invocation.getArgument(0);
            customer.setId(1L);
            return customer;
        });

        var response = customerService.createCustomer(validRequest());

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.fullName()).isEqualTo("Sara Bennani");
        assertThat(response.cin()).isEqualTo("CIN123");
        assertThat(response.phone()).isEqualTo("0600000000");
    }

    @Test
    void createCustomerShouldRejectDuplicateCin() {
        when(customerRepository.existsByPhone("0600000000")).thenReturn(false);
        when(customerRepository.existsByCin("CIN123")).thenReturn(true);

        assertThatThrownBy(() -> customerService.createCustomer(validRequest()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("CIN");
    }

    private CustomerRequest validRequest() {
        return new CustomerRequest(
                "Sara",
                "Bennani",
                "CIN123",
                "0600000000",
                "sara@example.com",
                "Rue 1",
                "Casablanca"
        );
    }
}
