package com.telecom.crm.repository;

import com.telecom.crm.entity.Offer;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface OfferRepository extends JpaRepository<Offer, Long>, JpaSpecificationExecutor<Offer> {

    List<Offer> findAllByOrderByNameAsc();

    List<Offer> findByActiveTrueOrderByNameAsc();

    List<Offer> findByIdIn(Collection<Long> ids);

    Optional<Offer> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);
}
