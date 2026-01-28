package com.samah.store.domain.entites;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "products",
        uniqueConstraints = @UniqueConstraint(name = "uk_products_slug", columnNames = "slug"),
        indexes = {
            @Index(name = "idx_products_active_deleted", columnList = "active, deleted"),
            @Index(name = "idx_products_category", columnList = "category_id"),
            @Index(name = "idx_products_created_at", columnList = "created_at")
        })
@Getter
@Setter
public class Product extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_products_category"))
    private Category category;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 180)
    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean deleted = false;
}
