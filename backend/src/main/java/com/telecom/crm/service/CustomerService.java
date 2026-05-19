package com.telecom.crm.service;

import com.telecom.crm.dto.CustomerRequest;
import com.telecom.crm.dto.CustomerResponse;
import com.telecom.crm.entity.Customer;
import com.telecom.crm.exception.ConflictException;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.mapper.CustomerMapper;
import com.telecom.crm.repository.CustomerRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public CustomerService(CustomerRepository customerRepository, CustomerMapper customerMapper) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAllByOrderByLastNameAscFirstNameAsc()
                .stream()
                .map(customerMapper::toResponse)
                .toList();
    }

    public CustomerResponse getCustomer(Long id) {
        return customerMapper.toResponse(findCustomerEntity(id));
    }

    public List<CustomerResponse> searchCustomers(String keyword) {
        return customerRepository.search(keyword == null ? "" : keyword.trim())
                .stream()
                .map(customerMapper::toResponse)
                .toList();
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        validateUniqueness(request.phone(), request.cin(), null);

        Customer customer = Customer.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .cin(request.cin())
                .phone(request.phone())
                .email(request.email())
                .address(request.address())
                .city(request.city())
                .build();

        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = findCustomerEntity(id);
        validateUniqueness(request.phone(), request.cin(), id);

        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setCin(request.cin());
        customer.setPhone(request.phone());
        customer.setEmail(request.email());
        customer.setAddress(request.address());
        customer.setCity(request.city());

        return customerMapper.toResponse(customerRepository.save(customer));
    }

    public Customer findCustomerEntity(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client introuvable."));
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = findCustomerEntity(id);
        customerRepository.delete(customer);
    }

    private void validateUniqueness(String phone, String cin, Long id) {
        boolean phoneExists = id == null
                ? customerRepository.existsByPhone(phone)
                : customerRepository.existsByPhoneAndIdNot(phone, id);
        if (phoneExists) {
            throw new ConflictException("Le numero de telephone existe deja.");
        }

        boolean cinExists = id == null
                ? customerRepository.existsByCin(cin)
                : customerRepository.existsByCinAndIdNot(cin, id);
        if (cinExists) {
            throw new ConflictException("Le CIN client existe deja.");
        }
    }
}
