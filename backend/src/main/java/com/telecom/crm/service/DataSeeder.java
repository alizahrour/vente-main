package com.telecom.crm.service;

import com.telecom.crm.entity.Customer;
import com.telecom.crm.entity.Offer;
import com.telecom.crm.entity.OfferCategory;
import com.telecom.crm.entity.Role;
import com.telecom.crm.entity.User;
import com.telecom.crm.repository.CustomerRepository;
import com.telecom.crm.repository.OfferRepository;
import com.telecom.crm.repository.RoleRepository;
import com.telecom.crm.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final OfferRepository offerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            CustomerRepository customerRepository,
            OfferRepository offerRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.customerRepository = customerRepository;
        this.offerRepository = offerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedRoles();
        seedUsers();
        seedCustomers();
        seedOffers();
    }

    private void seedRoles() {
        seedRole(Role.ADMIN);
        seedRole(Role.AGENT);
        seedRole(Role.SUPERVISOR);
    }

    private void seedRole(String roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            roleRepository.save(Role.builder().name(roleName).build());
        }
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            return;
        }

        Role adminRole = roleRepository.findByName(Role.ADMIN).orElseThrow();
        Role agentRole = roleRepository.findByName(Role.AGENT).orElseThrow();

        userRepository.saveAll(List.of(
                User.builder()
                        .username("admin")
                        .fullName("Admin Telecom")
                        .password(passwordEncoder.encode("admin123"))
                        .role(adminRole)
                        .enabled(true)
                        .build(),
                User.builder()
                        .username("agent")
                        .fullName("Agent Commercial")
                        .password(passwordEncoder.encode("agent123"))
                        .role(agentRole)
                        .enabled(true)
                        .build()
        ));
    }

    private void seedCustomers() {
        seedCustomer("Sara", "Bennani", "CIN-BN001", "0600000001", "sara.bennani@example.com", "12 Avenue Mohammed V", "Casablanca");
        seedCustomer("Youssef", "Alaoui", "CIN-AL002", "0600000002", "youssef.alaoui@example.com", "8 Rue Atlas", "Rabat");
        seedCustomer("ali", "credit", "AZ7489", "0667001122", null, "AZAHRAE", "SALE LAYAYDA");
        seedCustomer("Mouna", "El Fassi", "BK55210", "0677889900", "mouna.elfassi@example.com", "RUE ATLAS", "RABAT");
        seedCustomer("Karim", "Naciri", "CD90112", "0655442211", "karim.naciri@example.com", "BD BIR ANZARANE", "CASABLANCA");
    }

    private void seedCustomer(
            String firstName,
            String lastName,
            String cin,
            String phone,
            String email,
            String address,
            String city
    ) {
        if (customerRepository.existsByPhone(phone) || customerRepository.existsByCin(cin)) {
            return;
        }

        customerRepository.save(Customer.builder()
                .firstName(firstName)
                .lastName(lastName)
                .cin(cin)
                .phone(phone)
                .email(email)
                .address(address)
                .city(city)
                .build());
    }

    private void seedOffers() {
        if (offerRepository.count() > 0) {
            return;
        }

        offerRepository.saveAll(List.of(
                Offer.builder()
                        .code("MOBILE-10G")
                        .name("Forfait Mobile 10 Go")
                        .category(OfferCategory.MOBILE)
                        .description("Appels illimites et 10 Go d'internet.")
                        .price(new BigDecimal("99.00"))
                        .duration(30)
                        .active(true)
                        .build(),
                Offer.builder()
                        .code("FIBRE-50M")
                        .name("Fibre 50 Mb/s")
                        .category(OfferCategory.FIBRE)
                        .description("Connexion fixe pour usage residentiel.")
                        .price(new BigDecimal("249.00"))
                        .duration(30)
                        .active(true)
                        .build(),
                Offer.builder()
                        .code("BOX-TV")
                        .name("Option Box TV")
                        .category(OfferCategory.BOX)
                        .description("Bouquet TV de base.")
                        .price(new BigDecimal("79.00"))
                        .duration(30)
                        .active(true)
                        .build()
        ));
    }
}
