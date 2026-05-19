package com.telecom.crm.mapper;

import com.telecom.crm.dto.CustomerResponse;
import com.telecom.crm.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getFullName(),
                customer.getCin(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getCity()
        );
    }
}
