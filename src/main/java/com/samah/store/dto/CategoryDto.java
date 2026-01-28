package com.samah.store.dto;

import java.time.Instant;

public record CategoryDto(Long id, String name, String slug, boolean active, Instant updatedAt) {}

