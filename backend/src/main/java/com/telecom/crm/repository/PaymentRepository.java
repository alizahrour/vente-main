package com.telecom.crm.repository;

import com.telecom.crm.entity.Payment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Override
    @EntityGraph(attributePaths = {"sale", "sale.invoice"})
    List<Payment> findAll();

    @Override
    @EntityGraph(attributePaths = {"sale", "sale.invoice"})
    Optional<Payment> findById(Long id);

    @EntityGraph(attributePaths = {"sale", "sale.invoice"})
    Optional<Payment> findBySaleId(Long saleId);
}
