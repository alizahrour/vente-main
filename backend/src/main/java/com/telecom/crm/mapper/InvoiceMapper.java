package com.telecom.crm.mapper;

import com.telecom.crm.dto.InvoiceResponse;
import com.telecom.crm.entity.Invoice;
import org.springframework.stereotype.Component;

@Component
public class InvoiceMapper {

    private final SaleMapper saleMapper;

    public InvoiceMapper(SaleMapper saleMapper) {
        this.saleMapper = saleMapper;
    }

    public InvoiceResponse toResponse(Invoice invoice) {
        var sale = invoice.getSale();
        var customer = sale.getCustomer();
        var agent = sale.getAgent();
        var payment = sale.getPayment();

        return new InvoiceResponse(
                invoice.getInvoiceNumber(),
                sale.getId(),
                sale.getSaleNumber(),
                invoice.getGeneratedAt(),
                customer.getFullName(),
                customer.getCin(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getCity(),
                agent.getFullName(),
                agent.getUsername(),
                invoice.getTotalAmount(),
                payment.getMethod().name(),
                payment.getReference(),
                saleMapper.toResponse(sale).items()
        );
    }
}
