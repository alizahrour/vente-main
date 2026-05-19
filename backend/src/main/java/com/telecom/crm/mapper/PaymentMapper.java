package com.telecom.crm.mapper;

import com.telecom.crm.dto.PaymentResponse;
import com.telecom.crm.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getSale().getId(),
                payment.getAmount(),
                payment.getMethod().name(),
                payment.getStatus().name(),
                payment.getPaidAt(),
                payment.getReference(),
                payment.getSale().getInvoice() == null ? null : payment.getSale().getInvoice().getInvoiceNumber()
        );
    }
}
