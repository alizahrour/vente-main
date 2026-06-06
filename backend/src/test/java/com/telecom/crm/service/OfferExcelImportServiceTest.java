package com.telecom.crm.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.telecom.crm.entity.Offer;
import com.telecom.crm.repository.OfferRepository;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class OfferExcelImportServiceTest {

    @Autowired
    private OfferExcelImportService offerExcelImportService;

    @Autowired
    private OfferRepository offerRepository;

    @BeforeEach
    void setUp() {
        offerRepository.deleteAll();
    }

    @Test
    void importExcelSingleProductShouldPersistOffer() throws IOException {
        byte[] workbook = workbookBytes(
                new String[] {
                    "EXISTING_CODE", "CODE", "NAME", "PRODUCT_TYPE_CODE", "PRODUCT_TYPE_DESC_TEMP",
                    "MARQUE", "BALANCE", "HIERARCHY_CODE", "PRICE", "Eligible pour clients normaux"
                },
                List.<String[]>of(new String[] {
                        "OLD-001", "JWL-001", "Jawal Illimite", "RECHARGE", "Recharge physique",
                        "Maroc Telecom", "PREPAID", "Recharge", "199", "oui"
                }),
                new String[] {
                    "Ancien_CODE", "CODE", "NAME", "PRODUCT_TYPE_CODE", "PRODUCT_TYPE_DESC_TEMP",
                    "HIERARCHY_CODE", "PRICE", "Eligible pour clients normaux"
                },
                List.of()
        );

        offerExcelImportService.importWorkbook(new ByteArrayInputStream(workbook));

        Offer offer = offerRepository.findByCode("JWL-001").orElseThrow();
        assertThat(offer.getExistingCode()).isEqualTo("OLD-001");
        assertThat(offer.getProductTypeDescription()).isEqualTo("Recharge physique");
        assertThat(offer.getBrand()).isEqualTo("Maroc Telecom");
        assertThat(offer.getHierarchyCode()).isEqualTo("Recharge");
        assertThat(offer.getPrice()).isEqualByComparingTo("199.00");
        assertThat(offer.getEligibleForNormalCustomer()).isTrue();
        assertThat(offer.getBundle()).isFalse();
        assertThat(offer.isActive()).isTrue();
    }

    @Test
    void importExcelBundleProductShouldPersistBundleOffer() throws IOException {
        byte[] workbook = workbookBytes(
                new String[] {
                    "EXISTING_CODE", "CODE", "NAME", "PRODUCT_TYPE_CODE", "PRODUCT_TYPE_DESC_TEMP",
                    "MARQUE", "BALANCE", "HIERARCHY_CODE", "PRICE", "Eligible pour clients normaux"
                },
                List.of(),
                new String[] {
                    "Ancien_CODE", "CODE", "NAME", "PRODUCT_TYPE_CODE", "PRODUCT_TYPE_DESC_TEMP",
                    "HIERARCHY_CODE", "PRICE", "Eligible pour clients normaux"
                },
                List.<String[]>of(new String[] {
                        "PACK-OLD", "PACK-001", "Pack Smartphone + SIM", "PACK", "poste bundle",
                        "PACK", "2499", "x"
                })
        );

        offerExcelImportService.importWorkbook(new ByteArrayInputStream(workbook));

        Offer offer = offerRepository.findByCode("PACK-001").orElseThrow();
        assertThat(offer.getExistingCode()).isEqualTo("PACK-OLD");
        assertThat(offer.getProductTypeCode()).isEqualTo("PACK");
        assertThat(offer.getBundle()).isTrue();
        assertThat(offer.getEligibleForNormalCustomer()).isTrue();
        assertThat(offer.getPrice()).isEqualByComparingTo("2499.00");
    }

    @Test
    void importExcelShouldUpdateExistingOfferWithoutDuplicateCode() throws IOException {
        byte[] firstWorkbook = workbookBytes(
                new String[] {
                    "EXISTING_CODE", "CODE", "NAME", "PRODUCT_TYPE_CODE", "PRODUCT_TYPE_DESC_TEMP",
                    "MARQUE", "BALANCE", "HIERARCHY_CODE", "PRICE", "Eligible pour clients normaux"
                },
                List.<String[]>of(new String[] {
                        "OLD-001", "JWL-001", "Jawal 20 Go", "RECHARGE", "Recharge physique",
                        "Maroc Telecom", "PREPAID", "Recharge", "99", "oui"
                }),
                new String[] {
                    "Ancien_CODE", "CODE", "NAME", "PRODUCT_TYPE_CODE", "PRODUCT_TYPE_DESC_TEMP",
                    "HIERARCHY_CODE", "PRICE", "Eligible pour clients normaux"
                },
                List.of()
        );

        byte[] secondWorkbook = workbookBytes(
                new String[] {
                    "EXISTING_CODE", "CODE", "NAME", "PRODUCT_TYPE_CODE", "PRODUCT_TYPE_DESC_TEMP",
                    "MARQUE", "BALANCE", "HIERARCHY_CODE", "PRICE", "Eligible pour clients normaux"
                },
                List.<String[]>of(new String[] {
                        "OLD-001", "JWL-001", "Jawal 25 Go", "RECHARGE", "Recharge physique",
                        "Maroc Telecom", "PREPAID", "Recharge", "119", "oui"
                }),
                new String[] {
                    "Ancien_CODE", "CODE", "NAME", "PRODUCT_TYPE_CODE", "PRODUCT_TYPE_DESC_TEMP",
                    "HIERARCHY_CODE", "PRICE", "Eligible pour clients normaux"
                },
                List.of()
        );

        offerExcelImportService.importWorkbook(new ByteArrayInputStream(firstWorkbook));
        offerExcelImportService.importWorkbook(new ByteArrayInputStream(secondWorkbook));

        assertThat(offerRepository.count()).isEqualTo(1);
        Offer offer = offerRepository.findByCode("JWL-001").orElseThrow();
        assertThat(offer.getName()).isEqualTo("Jawal 25 Go");
        assertThat(offer.getPrice()).isEqualByComparingTo("119.00");
    }

    private byte[] workbookBytes(
            String[] singleHeaders,
            List<String[]> singleRows,
            String[] bundleHeaders,
            List<String[]> bundleRows
    ) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            var singleSheet = workbook.createSheet("RT_SINGLE_PRODUCT(sample)");
            singleSheet.createRow(0).createCell(0).setCellValue("Single");
            writeRow(singleSheet, 1, singleHeaders);
            for (int index = 0; index < singleRows.size(); index++) {
                writeRow(singleSheet, index + 2, singleRows.get(index));
            }

            var bundleSheet = workbook.createSheet("RT_BUNDLE_PRODUCT(sample)");
            bundleSheet.createRow(0).createCell(0).setCellValue("Bundle");
            writeRow(bundleSheet, 1, bundleHeaders);
            for (int index = 0; index < bundleRows.size(); index++) {
                writeRow(bundleSheet, index + 2, bundleRows.get(index));
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void writeRow(org.apache.poi.ss.usermodel.Sheet sheet, int rowIndex, String[] values) {
        var row = sheet.createRow(rowIndex);
        for (int columnIndex = 0; columnIndex < values.length; columnIndex++) {
            row.createCell(columnIndex).setCellValue(values[columnIndex]);
        }
    }
}
