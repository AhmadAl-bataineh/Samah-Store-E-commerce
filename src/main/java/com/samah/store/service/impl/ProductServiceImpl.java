package com.samah.store.service.impl;

import com.samah.store.domain.entites.*;
import com.samah.store.dto.*;
import com.samah.store.exception.BadRequestException;
import com.samah.store.exception.NotFoundException;
import com.samah.store.repository.*;
import com.samah.store.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              ProductVariantRepository variantRepository,
                              ProductImageRepository imageRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.variantRepository = variantRepository;
        this.imageRepository = imageRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryDto> search(String q, Long categoryId, Double minPrice, Double maxPrice, Pageable pageable) {
        // Always filter for active and non-deleted products in public search
        Specification<Product> spec = Specification.where((root, query, cb) ->
            cb.and(cb.isTrue(root.get("active")), cb.isFalse(root.get("deleted")))
        );

        if (q != null && !q.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), "%" + q.toLowerCase() + "%"));
        }
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }

        List<Long> priceFilteredProductIds = variantRepository.findDistinctProductIdsByPriceRange(
                minPrice == null ? null : BigDecimal.valueOf(minPrice),
                maxPrice == null ? null : BigDecimal.valueOf(maxPrice)
        );
        if (minPrice != null || maxPrice != null) {
            if (priceFilteredProductIds.isEmpty()) {
                return Page.empty(pageable);
            }
            spec = spec.and((root, query, cb) -> root.get("id").in(priceFilteredProductIds));
        }

        Sort sortToUse = pageable.getSort().isUnsorted()
                ? Sort.by(Sort.Direction.DESC, "createdAt")
                : pageable.getSort();
        PageRequest pageRequest = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sortToUse);
        Page<Product> idPage = productRepository.findAll(spec, pageRequest);
        List<Long> pageIds = idPage.stream().map(Product::getId).toList();
        if (pageIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, idPage.getTotalElements());
        }

        Map<Long, BigDecimal> minPrices = variantRepository.findByProductIdIn(pageIds).stream()
                .collect(Collectors.groupingBy(v -> v.getProduct().getId(),
                        Collectors.mapping(ProductVariant::getPrice, Collectors.collectingAndThen(Collectors.minBy(BigDecimal::compareTo), opt -> opt.orElse(null)))));

        Map<Long, String> primaryImages = imageRepository.findByProductIdIn(pageIds).stream()
                .collect(Collectors.groupingBy(pi -> pi.getProduct().getId(),
                        Collectors.collectingAndThen(Collectors.minBy(java.util.Comparator.comparing(ProductImage::getSortOrder)), opt -> opt.map(ProductImage::getUrl).orElse(null))));

        List<ProductSummaryDto> summaries = idPage.stream().map(p -> new ProductSummaryDto(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.isActive(),
                p.isDeleted(),
                new CategoryDto(p.getCategory().getId(), p.getCategory().getName(), p.getCategory().getSlug(), p.getCategory().isActive(), p.getCategory().getUpdatedAt()),
                primaryImages.get(p.getId()),
                minPrices.get(p.getId())
        )).toList();

        return new PageImpl<>(summaries, pageable, idPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDto getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        // Only return active, non-deleted products for public access
        if (!product.isActive() || product.isDeleted()) {
            throw new NotFoundException("Product not found");
        }
        List<ProductVariant> variants = variantRepository.findByProductIdAndActiveIsTrueAndDeletedIsFalse(product.getId());
        List<ProductImage> images = imageRepository.findByProductIdOrderBySortOrderAsc(product.getId());
        return toDto(product, variants, images);
    }

    @Override
    @Transactional
    public ProductDto create(ProductDto dto) {
        Category category = categoryRepository.findById(dto.category().id())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        Product product = new Product();
        product.setName(dto.name());
        product.setSlug(dto.slug());
        product.setDescription(dto.description());
        product.setActive(dto.active());
        product.setDeleted(dto.deleted());
        product.setCategory(category);
        Product saved = productRepository.save(product);

        saveImages(saved, dto.images());
        saveVariants(saved, dto.variants());

        return getBySlug(saved.getSlug());
    }

    @Override
    @Transactional
    public ProductDto update(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        Category category = categoryRepository.findById(dto.category().id())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        product.setName(dto.name());
        product.setSlug(dto.slug());
        product.setDescription(dto.description());
        product.setActive(dto.active());
        product.setDeleted(dto.deleted());
        product.setCategory(category);
        Product saved = productRepository.save(product);

        variantRepository.deleteAll(variantRepository.findByProductId(product.getId()));
        imageRepository.deleteAll(imageRepository.findByProductIdOrderBySortOrderAsc(product.getId()));
        saveVariants(saved, dto.variants());
        saveImages(saved, dto.images());

        return getBySlug(saved.getSlug());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        product.setDeleted(true);
        product.setActive(false);
        productRepository.save(product);
    }

    private void saveVariants(Product product, List<ProductVariantDto> variants) {
        if (variants == null) return;
        for (ProductVariantDto v : variants) {
            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setSku(v.sku());
            variant.setSize(v.size());
            variant.setColor(v.color());
            variant.setPrice(v.price());
            variant.setStockQuantity(v.stockQuantity());
            variant.setActive(v.active());
            variant.setDeleted(v.deleted());
            variantRepository.save(variant);
        }
    }

    private void saveImages(Product product, List<ProductImageDto> images) {
        if (images == null) return;
        for (ProductImageDto img : images) {
            ProductImage pi = new ProductImage();
            pi.setProduct(product);
            pi.setUrl(img.url());
            pi.setSortOrder(img.sortOrder());
            imageRepository.save(pi);
        }
    }

    private ProductDto toDto(Product product, List<ProductVariant> variants, List<ProductImage> images) {
        CategoryDto categoryDto = new CategoryDto(product.getCategory().getId(), product.getCategory().getName(), product.getCategory().getSlug(), product.getCategory().isActive(), product.getCategory().getUpdatedAt());
        List<ProductVariantDto> variantDtos = variants == null ? null : variants.stream()
                .map(v -> new ProductVariantDto(v.getId(), v.getSku(), v.getSize(), v.getColor(), v.getPrice(), v.getStockQuantity(), v.isActive(), v.isDeleted()))
                .toList();
        List<ProductImageDto> imageDtos = images == null ? null : images.stream()
                .map(i -> new ProductImageDto(i.getId(), i.getUrl(), i.getSortOrder()))
                .toList();
        return new ProductDto(product.getId(), product.getName(), product.getSlug(), product.getDescription(),
                product.isActive(), product.isDeleted(), categoryDto, imageDtos, variantDtos, product.getUpdatedAt());
    }
}
