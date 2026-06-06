package com.telecom.crm.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class OfferExcelImportBootstrap implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(OfferExcelImportBootstrap.class);

    private final OfferExcelImportService offerExcelImportService;

    public OfferExcelImportBootstrap(OfferExcelImportService offerExcelImportService) {
        this.offerExcelImportService = offerExcelImportService;
    }

    @Override
    public void run(String... args) {
        try {
            offerExcelImportService.importFromClasspath();
        } catch (RuntimeException exception) {
            LOGGER.error("Import automatique du catalogue Excel impossible.", exception);
        }
    }
}
