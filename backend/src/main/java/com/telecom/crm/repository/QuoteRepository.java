package com.telecom.crm.repository;

import com.telecom.crm.entity.Quote;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteRepository extends JpaRepository<Quote, Long> {

    boolean existsByQuoteNumber(String quoteNumber);

    @Override
    @EntityGraph(attributePaths = {"customer", "items", "items.offer"})
    Optional<Quote> findById(Long id);
}
