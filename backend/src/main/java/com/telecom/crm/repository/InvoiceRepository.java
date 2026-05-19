package com.telecom.crm.repository;

import com.telecom.crm.entity.Invoice;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Override
    @EntityGraph(attributePaths = {
            "sale",
            "sale.customer",
            "sale.agent",
            "sale.payment",
            "sale.items",
            "sale.items.offer"
    })
    List<Invoice> findAll();

    @Override
    @EntityGraph(attributePaths = {
            "sale",
            "sale.customer",
            "sale.agent",
            "sale.payment",
            "sale.items",
            "sale.items.offer"
    })
    Optional<Invoice> findById(Long id);

    @EntityGraph(attributePaths = {
            "sale",
            "sale.customer",
            "sale.agent",
            "sale.payment",
            "sale.items",
            "sale.items.offer"
    })
    Optional<Invoice> findBySaleId(Long saleId);

    boolean existsByInvoiceNumber(String invoiceNumber);
}
