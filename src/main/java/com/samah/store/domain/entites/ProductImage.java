package com.samah.store.domain.entites;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_images",
        indexes = {
                @Index(name = "idx_images_product_sort", columnList = "product_id, sort_order")
        })
@Getter
@Setter
public class ProductImage extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_images_product"))
    private Product product;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private Integer sortOrder = 0;
}
