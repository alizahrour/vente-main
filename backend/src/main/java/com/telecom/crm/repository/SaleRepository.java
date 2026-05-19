package com.telecom.crm.repository;

import com.telecom.crm.entity.Sale;
import com.telecom.crm.entity.SaleStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Override
    @EntityGraph(attributePaths = {"customer", "agent", "items", "items.offer", "payment", "invoice"})
    Optional<Sale> findById(Long id);

    @EntityGraph(attributePaths = {"customer", "agent", "items", "items.offer", "payment", "invoice"})
    List<Sale> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"customer", "agent", "items", "items.offer", "payment", "invoice"})
    List<Sale> findTop5ByOrderByCreatedAtDesc();

    long countByStatus(SaleStatus status);

    @Query("select coalesce(sum(s.totalAmount), 0) from Sale s where s.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") SaleStatus status);

    @Query("select count(s) from Sale s where s.payment is not null")
    long countPaidSales();
}
