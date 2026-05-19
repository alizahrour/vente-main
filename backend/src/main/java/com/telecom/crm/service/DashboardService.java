package com.telecom.crm.service;

import com.telecom.crm.dto.DashboardMetricResponse;
import com.telecom.crm.dto.DashboardResponse;
import com.telecom.crm.dto.RecentSaleResponse;
import com.telecom.crm.entity.PaymentStatus;
import com.telecom.crm.entity.Role;
import com.telecom.crm.entity.Sale;
import com.telecom.crm.entity.SaleStatus;
import com.telecom.crm.entity.User;
import com.telecom.crm.mapper.SaleMapper;
import com.telecom.crm.repository.CustomerRepository;
import com.telecom.crm.repository.OfferRepository;
import com.telecom.crm.repository.SaleRepository;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private static final EnumSet<SaleStatus> REVENUE_STATUSES = EnumSet.of(SaleStatus.VALIDATED, SaleStatus.PAID);

    private final CustomerRepository customerRepository;
    private final OfferRepository offerRepository;
    private final SaleRepository saleRepository;
    private final UserContextService userContextService;
    private final SaleMapper saleMapper;

    public DashboardService(
            CustomerRepository customerRepository,
            OfferRepository offerRepository,
            SaleRepository saleRepository,
            UserContextService userContextService,
            SaleMapper saleMapper
    ) {
        this.customerRepository = customerRepository;
        this.offerRepository = offerRepository;
        this.saleRepository = saleRepository;
        this.userContextService = userContextService;
        this.saleMapper = saleMapper;
    }

    public DashboardResponse getDashboard() {
        List<Sale> sales = getVisibleSales();
        List<Sale> revenueSales = sales.stream().filter(this::countsForRevenue).toList();

        List<RecentSaleResponse> recentSales = sales.stream()
                .limit(8)
                .map(saleMapper::toRecentSaleResponse)
                .toList();

        BigDecimal revenue = revenueSales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardResponse(
                customerRepository.count(),
                offerRepository.count(),
                sales.size(),
                countByStatus(sales, SaleStatus.DRAFT),
                countByStatus(sales, SaleStatus.VALIDATED),
                countPaidSales(sales),
                countByStatus(sales, SaleStatus.CANCELLED),
                revenue,
                recentSales
        );
    }

    public List<DashboardMetricResponse> getSalesByOffer() {
        Map<String, BigDecimal> totals = getRevenueSales()
                .stream()
                .flatMap(sale -> sale.getItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getOffer().getName(),
                        Collectors.mapping(
                                item -> BigDecimal.valueOf(item.getQuantity()),
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        return toSortedMetrics(totals).stream().limit(6).toList();
    }

    public List<DashboardMetricResponse> getSalesByAgent() {
        Map<String, BigDecimal> totals = getRevenueSales()
                .stream()
                .collect(Collectors.groupingBy(
                        sale -> sale.getAgent().getFullName(),
                        Collectors.mapping(
                                sale -> BigDecimal.ONE,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                        )
                ));

        return toSortedMetrics(totals);
    }

    public List<DashboardMetricResponse> getRevenueByMonth() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, BigDecimal> totals = getRevenueSales()
                .stream()
                .collect(Collectors.groupingBy(
                        sale -> sale.getCreatedAt().format(formatter),
                        TreeMap::new,
                        Collectors.mapping(Sale::getTotalAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return totals.entrySet()
                .stream()
                .map(entry -> new DashboardMetricResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<Sale> getRevenueSales() {
        return getVisibleSales().stream().filter(this::countsForRevenue).toList();
    }

    private List<Sale> getVisibleSales() {
        User currentUser = userContextService.getCurrentUser();
        Predicate<Sale> visibility = Role.AGENT.equals(currentUser.getRole().getName())
                ? sale -> sale.getAgent().getId().equals(currentUser.getId())
                : sale -> true;

        return saleRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(visibility)
                .toList();
    }

    private boolean countsForRevenue(Sale sale) {
        return REVENUE_STATUSES.contains(sale.getStatus());
    }

    private long countByStatus(List<Sale> sales, SaleStatus status) {
        return sales.stream().filter(sale -> sale.getStatus() == status).count();
    }

    private long countPaidSales(List<Sale> sales) {
        return sales.stream()
                .filter(sale -> sale.getStatus() == SaleStatus.PAID)
                .filter(sale -> sale.getPayment() != null && sale.getPayment().getStatus() == PaymentStatus.PAID)
                .count();
    }

    private List<DashboardMetricResponse> toSortedMetrics(Map<String, BigDecimal> totals) {
        return totals.entrySet()
                .stream()
                .map(entry -> new DashboardMetricResponse(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(DashboardMetricResponse::value).reversed())
                .toList();
    }
}
