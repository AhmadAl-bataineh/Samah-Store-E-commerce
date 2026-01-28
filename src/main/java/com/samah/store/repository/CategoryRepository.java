package com.samah.store.repository;

import com.samah.store.domain.entites.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);
    Optional<Category> findBySlug(String slug);

    // Filter active categories in SQL for better performance
    List<Category> findByActiveTrue();
}

