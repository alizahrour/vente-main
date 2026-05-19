package com.telecom.crm.service;

import com.telecom.crm.dto.PaymentResponse;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.mapper.PaymentMapper;
import com.telecom.crm.repository.PaymentRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    public PaymentService(PaymentRepository paymentRepository, PaymentMapper paymentMapper) {
        this.paymentRepository = paymentRepository;
        this.paymentMapper = paymentMapper;
    }

    public List<PaymentResponse> getPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    public PaymentResponse getPayment(Long id) {
        return paymentRepository.findById(id)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Paiement introuvable."));
    }
}
