package com.samah.store.service.impl;

import com.samah.store.domain.entites.Category;
import com.samah.store.dto.CategoryDto;
import com.samah.store.exception.ConflictException;
import com.samah.store.exception.NotFoundException;
import com.samah.store.repository.CategoryRepository;
import com.samah.store.service.CategoryService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto create(String name, String slug, boolean active) {
        categoryRepository.findBySlug(slug).ifPresent(c -> {
            throw new ConflictException("Category slug already exists");
        });
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setActive(active);
        Category saved = categoryRepository.save(category);
        return toDto(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryDto update(Long id, String name, String slug, boolean active) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        categoryRepository.findBySlug(slug)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new ConflictException("Category slug already exists"); });
        category.setName(name);
        category.setSlug(slug);
        category.setActive(active);
        return toDto(categoryRepository.save(category));
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDto get(Long id) {
        return categoryRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new NotFoundException("Category not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> listAll() {
        return categoryRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'public'")
    public List<CategoryDto> listPublic() {
        // Filter in SQL for better performance
        return categoryRepository.findByActiveTrue().stream()
                .map(this::toDto)
                .toList();
    }

    private CategoryDto toDto(Category category) {
        return new CategoryDto(category.getId(), category.getName(), category.getSlug(), category.isActive(), category.getUpdatedAt());
    }
}

