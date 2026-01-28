package com.samah.store.controller;

import com.samah.store.dto.CategoryDto;
import com.samah.store.dto.ProductDto;
import com.samah.store.dto.ProductSummaryDto;
import com.samah.store.service.CategoryService;
import com.samah.store.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
public class PublicCatalogController {

    private final CategoryService categoryService;
    private final ProductService productService;

    public PublicCatalogController(CategoryService categoryService, ProductService productService) {
        this.categoryService = categoryService;
        this.productService = productService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> listCategories(WebRequest request) {
        List<CategoryDto> categories = categoryService.listPublic();

        // Stable ETag: count + sorted IDs (deterministic across restarts)
        String etag = generateCategoriesETag(categories);
        if (request.checkNotModified(etag)) {
            return ResponseEntity.status(304).build();
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .eTag(etag)
                .body(categories);
    }

    @GetMapping("/products")
    public ResponseEntity<Page<ProductSummaryDto>> searchProducts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            Pageable pageable) {
        // No ETag for dynamic search results - just HTTP cache
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.MINUTES).cachePublic())
                .body(productService.search(q, categoryId, minPrice, maxPrice, pageable));
    }

    @GetMapping("/products/{slug}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable String slug, WebRequest request) {
        ProductDto product = productService.getBySlug(slug);

        // Stable ETag: product ID + updatedAt timestamp
        String etag = generateProductETag(product);
        if (request.checkNotModified(etag)) {
            return ResponseEntity.status(304).build();
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(2, TimeUnit.MINUTES).cachePublic())
                .eTag(etag)
                .body(product);
    }

    /**
     * Generate stable ETag for categories list.
     * Format: "c{count}-{maxUpdatedAtMs}" e.g. "c3-1706012345678"
     * Changes when: category added/removed OR any category field updated.
     */
    private String generateCategoriesETag(List<CategoryDto> categories) {
        long maxUpdatedAt = categories.stream()
                .map(CategoryDto::updatedAt)
                .filter(java.util.Objects::nonNull)
                .mapToLong(java.time.Instant::toEpochMilli)
                .max()
                .orElse(0L);
        return "\"c" + categories.size() + "-" + maxUpdatedAt + "\"";
    }

    /**
     * Generate stable ETag for single product.
     * Format: "p{id}-{updatedAtEpochMilli}" e.g. "p42-1706012345678"
     * Changes when product is updated.
     */
    private String generateProductETag(ProductDto product) {
        long timestamp = product.updatedAt() != null ? product.updatedAt().toEpochMilli() : 0L;
        return "\"p" + product.id() + "-" + timestamp + "\"";
    }
}
