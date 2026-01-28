package com.samah.store.domain.entites;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_variant_product_size_color",
                        columnNames = {"product_id", "size", "color"}
                ),
                @UniqueConstraint(
                        name = "uk_variant_sku",
                        columnNames = {"sku"}
                )
        },
        indexes = {
                @Index(name = "idx_variants_product", columnList = "product_id"),
                @Index(name = "idx_variants_price", columnList = "price"),
                @Index(name = "idx_variants_active_deleted", columnList = "active, deleted")
        })
@Getter
@Setter
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_variants_product"))
    private Product product;

    @Column(nullable = false, length = 40)
    private String sku;

    @Column(nullable = false, length = 10)
    private String size;

    @Column(nullable = false, length = 30)
    private String color;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean deleted = false;
}
