package com.telecom.crm.repository;

import com.telecom.crm.entity.Offer;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findAllByOrderByNameAsc();

    List<Offer> findByActiveTrueOrderByNameAsc();

    List<Offer> findByIdIn(Collection<Long> ids);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);
}
