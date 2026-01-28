package com.samah.store.controller;

import com.samah.store.dto.HeroSettingsResponseDto;
import com.samah.store.service.HeroSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/public/hero")
@RequiredArgsConstructor
public class HeroPublicController {

    private final HeroSettingsService heroSettingsService;

    @GetMapping
    public ResponseEntity<HeroSettingsResponseDto> getHero(WebRequest request) {
        HeroSettingsResponseDto hero = heroSettingsService.getPublicHero();

        // Use updatedAt timestamp for ETag if available, otherwise hash
        String etag = hero.updatedAt() != null
                ? "\"" + hero.updatedAt().toEpochMilli() + "\""
                : "\"" + Integer.toHexString(hero.hashCode()) + "\"";

        if (request.checkNotModified(etag)) {
            return ResponseEntity.status(304).build();
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .eTag(etag)
                .body(hero);
    }
}
