package com.samah.store.dto;

import java.time.Instant;
import java.util.List;

public record ProductDto(Long id, String name, String slug, String description,
                         boolean active, boolean deleted, CategoryDto category,
                         List<ProductImageDto> images, List<ProductVariantDto> variants,
                         Instant updatedAt) {}

