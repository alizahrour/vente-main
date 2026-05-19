package com.telecom.crm.service;

import com.telecom.crm.dto.InvoiceResponse;
import com.telecom.crm.entity.Invoice;
import com.telecom.crm.entity.PaymentStatus;
import com.telecom.crm.entity.Sale;
import com.telecom.crm.entity.SaleStatus;
import com.telecom.crm.exception.BadRequestException;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.mapper.InvoiceMapper;
import com.telecom.crm.repository.InvoiceRepository;
import com.telecom.crm.repository.SaleRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SaleRepository saleRepository;
    private final InvoiceMapper invoiceMapper;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            SaleRepository saleRepository,
            InvoiceMapper invoiceMapper
    ) {
        this.invoiceRepository = invoiceRepository;
        this.saleRepository = saleRepository;
        this.invoiceMapper = invoiceMapper;
    }

    public List<InvoiceResponse> getInvoices() {
        return invoiceRepository.findAll()
                .stream()
                .map(invoiceMapper::toResponse)
                .toList();
    }

    public InvoiceResponse getInvoice(Long id) {
        return invoiceRepository.findById(id)
                .map(invoiceMapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Facture introuvable."));
    }

    public InvoiceResponse getInvoiceBySale(Long saleId) {
        return invoiceRepository.findBySaleId(saleId)
                .map(invoiceMapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Facture introuvable pour cette vente."));
    }

    @Transactional
    public InvoiceResponse generateInvoice(Long saleId) {
        return invoiceRepository.findBySaleId(saleId)
                .map(invoiceMapper::toResponse)
                .orElseGet(() -> invoiceMapper.toResponse(createInvoice(saleId)));
    }

    public Invoice createInvoiceEntityForPaidSale(Sale sale) {
        assertSaleIsPaid(sale);
        return Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .sale(sale)
                .totalAmount(sale.getTotalAmount())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private Invoice createInvoice(Long saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new NotFoundException("Vente introuvable."));
        assertSaleIsPaid(sale);

        Invoice invoice = createInvoiceEntityForPaidSale(sale);
        sale.setInvoice(invoice);
        return invoiceRepository.save(invoice);
    }

    private void assertSaleIsPaid(Sale sale) {
        boolean paid = sale.getStatus() == SaleStatus.PAID
                && sale.getPayment() != null
                && sale.getPayment().getStatus() == PaymentStatus.PAID;

        if (!paid) {
            throw new BadRequestException("La facture ne peut etre generee que pour une vente payee.");
        }
    }

    private String generateInvoiceNumber() {
        String invoiceNumber;
        do {
            invoiceNumber = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (invoiceRepository.existsByInvoiceNumber(invoiceNumber));
        return invoiceNumber;
    }
}
