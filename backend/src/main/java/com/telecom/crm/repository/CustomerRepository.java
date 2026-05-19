package com.telecom.crm.repository;

import com.telecom.crm.entity.Customer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findAllByOrderByLastNameAscFirstNameAsc();

    @Query("""
            select c from Customer c
            where lower(c.firstName) like lower(concat('%', :keyword, '%'))
               or lower(c.lastName) like lower(concat('%', :keyword, '%'))
               or lower(c.cin) like lower(concat('%', :keyword, '%'))
               or lower(c.phone) like lower(concat('%', :keyword, '%'))
               or lower(coalesce(c.email, '')) like lower(concat('%', :keyword, '%'))
            order by c.lastName asc, c.firstName asc
            """)
    List<Customer> search(@Param("keyword") String keyword);

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    boolean existsByCin(String cin);

    boolean existsByCinAndIdNot(String cin, Long id);
}
