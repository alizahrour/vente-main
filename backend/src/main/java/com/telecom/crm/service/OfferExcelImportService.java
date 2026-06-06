package com.telecom.crm.service;

import com.telecom.crm.dto.OfferImportResponse;
import com.telecom.crm.entity.Offer;
import com.telecom.crm.entity.OfferCategory;
import com.telecom.crm.exception.NotFoundException;
import com.telecom.crm.repository.OfferRepository;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class OfferExcelImportService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OfferExcelImportService.class);
    private static final String IMPORT_RESOURCE = "imports/ListProduitsPrepayes.xlsx";
    private static final String SINGLE_SHEET = "RT_SINGLE_PRODUCT(sample)";
    private static final String BUNDLE_SHEET = "RT_BUNDLE_PRODUCT(sample)";

    private final OfferRepository offerRepository;
    private final DataFormatter dataFormatter = new DataFormatter(Locale.FRANCE);

    public OfferExcelImportService(OfferRepository offerRepository) {
        this.offerRepository = offerRepository;
    }

    @Transactional
    public OfferImportResponse importFromClasspath() {
        ClassPathResource resource = new ClassPathResource(IMPORT_RESOURCE);
        if (!resource.exists()) {
            throw new NotFoundException("Fichier d'import Excel introuvable dans le classpath.");
        }

        try (InputStream inputStream = resource.getInputStream()) {
            return importWorkbook(inputStream);
        } catch (IOException exception) {
            throw new IllegalStateException("Lecture du fichier d'import impossible.", exception);
        }
    }

    @Transactional
    public OfferImportResponse importWorkbook(InputStream inputStream) {
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            ImportCounter counter = new ImportCounter();
            importSheetSingleProducts(workbook.getSheet(SINGLE_SHEET), counter);
            importSheetBundleProducts(workbook.getSheet(BUNDLE_SHEET), counter);

            LOGGER.info(
                    "Import catalogue Excel termine: {} produits simples importes, {} bundles importes, {} offres mises a jour, {} lignes ignorees.",
                    counter.importedSingles,
                    counter.importedBundles,
                    counter.updatedOffers,
                    counter.skippedRows
            );

            return counter.toResponse();
        } catch (IOException exception) {
            throw new IllegalStateException("Lecture du classeur Excel impossible.", exception);
        }
    }

    void importSheetSingleProducts(Sheet sheet, ImportCounter counter) {
        importSheet(sheet, false, counter);
    }

    void importSheetBundleProducts(Sheet sheet, ImportCounter counter) {
        importSheet(sheet, true, counter);
    }

    BigDecimal parsePrice(String rawPrice) {
        if (!StringUtils.hasText(rawPrice)) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        String normalized = rawPrice
                .replace('\u00A0', ' ')
                .replace("MAD", "")
                .replace("DHS", "")
                .replace("Dh", "")
                .replace(" ", "")
                .replace(",", ".");

        if (!StringUtils.hasText(normalized)) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        return new BigDecimal(normalized).setScale(2, RoundingMode.HALF_UP);
    }

    boolean parseEligibility(String rawValue) {
        if (!StringUtils.hasText(rawValue)) {
            return false;
        }

        String normalized = normalize(rawValue);
        return normalized.equals("oui")
                || normalized.equals("true")
                || normalized.equals("x")
                || normalized.equals("1")
                || normalized.equals("yes")
                || normalized.equals("y")
                || normalized.equals("s");
    }

    private void importSheet(Sheet sheet, boolean bundle, ImportCounter counter) {
        if (sheet == null) {
            LOGGER.warn("Feuille Excel introuvable pour bundle={}.", bundle);
            return;
        }

        Row headerRow = findHeaderRow(sheet);
        if (headerRow == null) {
            LOGGER.warn("Aucune ligne d'en-tete detectee sur la feuille {}.", sheet.getSheetName());
            return;
        }

        Map<String, Integer> headerIndexes = extractHeaderIndexes(headerRow);
        for (int rowIndex = headerRow.getRowNum() + 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null || isBlankRow(row, headerIndexes)) {
                counter.skippedRows++;
                continue;
            }

            String code = getCellValue(row, headerIndexes, "CODE");
            String name = getCellValue(row, headerIndexes, "NAME");

            if (!StringUtils.hasText(code) || !StringUtils.hasText(name)) {
                counter.skippedRows++;
                continue;
            }

            String existingCode = firstNonBlank(
                    getCellValue(row, headerIndexes, "EXISTING_CODE"),
                    getCellValue(row, headerIndexes, "Ancien_CODE")
            );
            String productTypeCode = getCellValue(row, headerIndexes, "PRODUCT_TYPE_CODE");
            String productTypeDescription = getCellValue(row, headerIndexes, "PRODUCT_TYPE_DESC_TEMP");
            String brand = getCellValue(row, headerIndexes, "MARQUE");
            String balance = getCellValue(row, headerIndexes, "BALANCE");
            String hierarchyCode = getCellValue(row, headerIndexes, "HIERARCHY_CODE");
            BigDecimal price = parsePrice(getCellValue(row, headerIndexes, "PRICE"));
            boolean eligibleForNormalCustomer = parseEligibility(
                    getCellValue(row, headerIndexes, "Eligible pour clients normaux")
            );

            Offer offer = offerRepository.findByCode(code.trim()).orElseGet(Offer::new);
            boolean existing = offer.getId() != null;

            offer.setCode(code.trim());
            offer.setExistingCode(trimToNull(existingCode));
            offer.setName(name.trim());
            offer.setCategory(resolveCategory(hierarchyCode, productTypeCode, productTypeDescription, name, bundle));
            offer.setDescription(trimToNull(productTypeDescription));
            offer.setProductTypeCode(trimToNull(productTypeCode));
            offer.setProductTypeDescription(trimToNull(productTypeDescription));
            offer.setBrand(trimToNull(brand));
            offer.setBalance(trimToNull(balance));
            offer.setHierarchyCode(trimToNull(hierarchyCode));
            offer.setPrice(price);
            offer.setDuration(30);
            offer.setEligibleForNormalCustomer(eligibleForNormalCustomer);
            offer.setBundle(bundle);
            offer.setActive(true);

            offerRepository.save(offer);

            if (existing) {
                counter.updatedOffers++;
            } else if (bundle) {
                counter.importedBundles++;
            } else {
                counter.importedSingles++;
            }
        }
    }

    private Row findHeaderRow(Sheet sheet) {
        for (int rowIndex = sheet.getFirstRowNum(); rowIndex <= Math.min(sheet.getLastRowNum(), 10); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) {
                continue;
            }

            Map<String, Integer> headerIndexes = extractHeaderIndexes(row);
            if (headerIndexes.containsKey("CODE") && headerIndexes.containsKey("NAME")) {
                return row;
            }
        }

        return null;
    }

    private Map<String, Integer> extractHeaderIndexes(Row headerRow) {
        Map<String, Integer> indexes = new HashMap<>();
        for (Cell cell : headerRow) {
            String value = dataFormatter.formatCellValue(cell);
            if (StringUtils.hasText(value)) {
                indexes.put(value.trim(), cell.getColumnIndex());
            }
        }
        return indexes;
    }

    private boolean isBlankRow(Row row, Map<String, Integer> headerIndexes) {
        return !StringUtils.hasText(getCellValue(row, headerIndexes, "CODE"))
                && !StringUtils.hasText(getCellValue(row, headerIndexes, "NAME"));
    }

    private String getCellValue(Row row, Map<String, Integer> headerIndexes, String header) {
        Integer index = headerIndexes.get(header);
        if (index == null) {
            return "";
        }

        Cell cell = row.getCell(index);
        return cell == null ? "" : dataFormatter.formatCellValue(cell).trim();
    }

    private OfferCategory resolveCategory(
            String hierarchyCode,
            String productTypeCode,
            String productTypeDescription,
            String name,
            boolean bundle
    ) {
        String source = normalize(String.join(
                " ",
                defaultString(hierarchyCode),
                defaultString(productTypeCode),
                defaultString(productTypeDescription),
                defaultString(name)
        ));

        if (source.contains("recharge")) {
            return OfferCategory.RECHARGE;
        }
        if (source.contains("fibre")) {
            return OfferCategory.FIBRE;
        }
        if (source.contains("adsl")) {
            return OfferCategory.ADSL;
        }
        if (source.contains("box") || source.contains("tv")) {
            return OfferCategory.BOX;
        }
        if (source.contains("internet") || source.contains("fixe")) {
            return OfferCategory.INTERNET;
        }
        if (bundle) {
            return OfferCategory.BOX;
        }
        return OfferCategory.MOBILE;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    static final class ImportCounter {
        private int importedSingles;
        private int importedBundles;
        private int updatedOffers;
        private int skippedRows;

        OfferImportResponse toResponse() {
            return new OfferImportResponse(importedSingles, importedBundles, updatedOffers, skippedRows);
        }
    }
}
