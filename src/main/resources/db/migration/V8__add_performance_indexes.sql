-- Performance optimization indexes
-- Safe to run multiple times (IF NOT EXISTS)
-- Run this manually or enable Flyway to apply automatically

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_active_deleted ON store.products (active, deleted);
CREATE INDEX IF NOT EXISTS idx_products_category ON store.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON store.products (created_at);

-- Product variants table indexes
CREATE INDEX IF NOT EXISTS idx_variants_product ON store.product_variants (product_id);
CREATE INDEX IF NOT EXISTS idx_variants_price ON store.product_variants (price);
CREATE INDEX IF NOT EXISTS idx_variants_active_deleted ON store.product_variants (active, deleted);

-- Product images table index
CREATE INDEX IF NOT EXISTS idx_images_product_sort ON store.product_images (product_id, sort_order);

-- Categories table index (for active filtering)
CREATE INDEX IF NOT EXISTS idx_categories_active ON store.categories (active);
