package com.samah.store.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CORS Configuration for Samah Store API
 *
 * Production: Set CORS_ALLOWED_ORIGINS env var to your domain(s)
 * Example: CORS_ALLOWED_ORIGINS=https://samah-store.tech,https://www.samah-store.tech
 *
 * NOTE: If frontend and backend are served from same origin (via reverse proxy),
 * CORS is not needed. This config is for cross-origin scenarios only.
 */
@Configuration
public class CorsConfig {

    // Default includes localhost for dev + production domain
    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000,https://samah-store.tech,https://www.samah-store.tech}")
    private String allowedOriginsEnv;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Parse comma-separated origins from env var, trim whitespace
        List<String> origins = Arrays.stream(allowedOriginsEnv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        configuration.setAllowedOrigins(origins);

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

