package com.telecom.crm.service;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class QuoteSchemaUpdater implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public QuoteSchemaUpdater(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        List<String> statements = List.of(
                "ALTER TABLE quotes ADD COLUMN IF NOT EXISTS customer_name_snapshot VARCHAR(160)",
                "ALTER TABLE quotes ADD COLUMN IF NOT EXISTS customer_contact_snapshot VARCHAR(120)",
                "ALTER TABLE quotes ADD COLUMN IF NOT EXISTS billing_account VARCHAR(80)",
                "ALTER TABLE quotes ADD COLUMN IF NOT EXISTS order_segment VARCHAR(30)",
                "ALTER TABLE quotes ADD COLUMN IF NOT EXISTS network_type VARCHAR(30)",
                "ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_expiration_date DATE",
                "ALTER TABLE quotes ADD COLUMN IF NOT EXISTS order_start_type VARCHAR(20)",
                "ALTER TABLE quotes ADD COLUMN IF NOT EXISTS description VARCHAR(500)",
                "UPDATE quotes SET customer_name_snapshot = COALESCE(customer_name_snapshot, 'Client inconnu')",
                "UPDATE quotes SET billing_account = COALESCE(billing_account, 'Non renseigne')",
                "UPDATE quotes SET order_segment = COALESCE(order_segment, 'RETAIL')",
                "UPDATE quotes SET network_type = COALESCE(network_type, 'DIRECT_NETWORK')",
                "UPDATE quotes SET quote_expiration_date = COALESCE(quote_expiration_date, CURRENT_DATE + 7)",
                "UPDATE quotes SET order_start_type = COALESCE(order_start_type, 'IMMEDIATE')"
        );

        statements.forEach(jdbcTemplate::execute);
    }
}
