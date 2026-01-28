package com.samah.store.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for performance optimization.
 * Uses Caffeine for high-performance in-memory caching.
 *
 * CACHE REGISTRY:
 * ---------------
 * | Cache Name  | TTL   | Max Size | Key Pattern      | Evicted By                    |
 * |-------------|-------|----------|------------------|-------------------------------|
 * | categories  | 5 min | 10       | 'public'         | create/update/delete category |
 * | hero        | 5 min | 10       | 'public'         | updateHero                    |
 *
 * SAFETY NOTES:
 * - All cached data is PUBLIC (no user-specific data)
 * - TTL=5min ensures stale data is refreshed reasonably fast
 * - @CacheEvict on all write paths ensures immediate invalidation
 * - No risk of key explosion: fixed keys ('public'), not dynamic
 */
@Configuration
@EnableCaching
public class CacheConfig {

    // Explicit cache names to prevent typos
    public static final String CACHE_CATEGORIES = "categories";
    public static final String CACHE_HERO = "hero";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        // Register only known cache names to prevent accidental cache creation
        cacheManager.setCacheNames(List.of(CACHE_CATEGORIES, CACHE_HERO));
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)  // Short TTL for safety
                .maximumSize(10)                         // Very small - only fixed keys
                .recordStats());                         // Enable stats for monitoring
        return cacheManager;
    }
}
