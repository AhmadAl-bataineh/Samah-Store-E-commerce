package com.samah.store.dto;

/**
 * DTO for admin user info (includes role)
 */
public record AdminInfoDto(Long id, String username, String email, String role, boolean enabled) {}
