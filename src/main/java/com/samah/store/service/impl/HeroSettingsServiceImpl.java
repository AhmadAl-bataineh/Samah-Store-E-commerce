package com.samah.store.service.impl;

import com.samah.store.domain.entites.HeroSettings;
import com.samah.store.dto.HeroSettingsRequestDto;
import com.samah.store.dto.HeroSettingsResponseDto;
import com.samah.store.repository.HeroSettingsRepository;
import com.samah.store.service.HeroSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HeroSettingsServiceImpl implements HeroSettingsService {

    private final HeroSettingsRepository heroSettingsRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "hero", key = "'public'")
    public HeroSettingsResponseDto getPublicHero() {
        // Use non-persisting fetch for public GET
        HeroSettings settings = getExistingOrDefaultInMemorySettings();
        return toDto(settings);
    }

    @Override
    @Transactional(readOnly = true)
    public HeroSettingsResponseDto getAdminHero() {
        // Admin GET should also not write to DB; return existing or in-memory default
        HeroSettings settings = getExistingOrDefaultInMemorySettings();
        return toDto(settings);
    }

    @Override
    @Transactional
    @CacheEvict(value = "hero", allEntries = true)
    public HeroSettingsResponseDto updateHero(HeroSettingsRequestDto dto) {
        HeroSettings settings = getOrCreateDefaultSettings();

        settings.setBadgeText(dto.badgeText());
        settings.setTitleLine1(dto.titleLine1());
        settings.setTitleLine2(dto.titleLine2());
        settings.setDescription(dto.description());
        settings.setCtaText(dto.ctaText());
        settings.setCtaLink(dto.ctaLink());
        settings.setHeroImageUrl(dto.heroImageUrl());

        HeroSettings saved = heroSettingsRepository.save(settings);
        return toDto(saved);
    }

    /**
     * Get the hero settings row, or create default if none exists.
     * This ensures we always have exactly one row (single-row settings pattern).
     * This method WILL persist a default if none exists and is used by admin write flows.
     */
    private HeroSettings getOrCreateDefaultSettings() {
        return heroSettingsRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> {
                    HeroSettings defaultSettings = new HeroSettings();
                    defaultSettings.setBadgeText("مجموعة جديدة");
                    defaultSettings.setTitleLine1("أناقة عصرية");
                    defaultSettings.setTitleLine2("بلمسة مميزة");
                    defaultSettings.setDescription("اكتشفي تشكيلتنا المختارة بعناية من الأزياء العصرية التي تعكس ذوقك الراقي");
                    defaultSettings.setCtaText("تسوّقي الآن");
                    defaultSettings.setCtaLink("/products");
                    defaultSettings.setHeroImageUrl("/assets/heroImage.jpg");
                    return heroSettingsRepository.save(defaultSettings);
                });
    }

    /**
     * Non-persisting variant used by the public and admin read-only endpoints.
     * If no persisted settings exist, return a default HERO object in-memory
     * without calling repository.save(...) so we don't write during a read-only transaction.
     */
    private HeroSettings getExistingOrDefaultInMemorySettings() {
        return heroSettingsRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> {
                    HeroSettings defaultSettings = new HeroSettings();
                    defaultSettings.setBadgeText("مجموعة جديدة");
                    defaultSettings.setTitleLine1("أناقة عصرية");
                    defaultSettings.setTitleLine2("بلمسة مميزة");
                    defaultSettings.setDescription("اكتشفي تشكيلتنا المختارة بعناية من الأزياء العصرية التي تعكس ذوقك الراقي");
                    defaultSettings.setCtaText("تسوّقي الآن");
                    defaultSettings.setCtaLink("/products");
                    defaultSettings.setHeroImageUrl("/assets/heroImage.jpg");
                    // NOTE: intentionally NOT saved - returned only in-memory
                    return defaultSettings;
                });
    }

    private HeroSettingsResponseDto toDto(HeroSettings settings) {
        return new HeroSettingsResponseDto(
                settings.getId(),
                settings.getBadgeText(),
                settings.getTitleLine1(),
                settings.getTitleLine2(),
                settings.getDescription(),
                settings.getCtaText(),
                settings.getCtaLink(),
                settings.getHeroImageUrl(),
                settings.getUpdatedAt()
        );
    }
}
