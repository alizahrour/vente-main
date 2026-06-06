package com.telecom.crm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "offers")
public class Offer extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, unique = true, length = 80)
    private String code;

    @Size(max = 80)
    @Column(length = 80)
    private String existingCode;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OfferCategory category;

    @Size(max = 255)
    @Column(length = 255)
    private String description;

    @Size(max = 80)
    @Column(length = 80)
    private String productTypeCode;

    @Size(max = 255)
    @Column(length = 255)
    private String productTypeDescription;

    @Size(max = 80)
    @Column(length = 80)
    private String brand;

    @Size(max = 80)
    @Column(length = 80)
    private String balance;

    @Size(max = 120)
    @Column(length = 120)
    private String hierarchyCode;

    @NotNull
    @DecimalMin(value = "0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer duration;

    @Column
    private Boolean eligibleForNormalCustomer;

    @Column
    private Boolean bundle;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
