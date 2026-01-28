-- =============================================================================
-- PostgreSQL Initialization Script for Samah Store
-- =============================================================================
-- This script runs ONCE when the database container is first created.
-- It creates the 'store' schema which the application expects.
-- =============================================================================

-- Create the store schema
CREATE SCHEMA IF NOT EXISTS store;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON SCHEMA store TO samah;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA store TO samah;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA store TO samah;

-- Set default schema for new objects
ALTER DEFAULT PRIVILEGES IN SCHEMA store GRANT ALL PRIVILEGES ON TABLES TO samah;
ALTER DEFAULT PRIVILEGES IN SCHEMA store GRANT ALL PRIVILEGES ON SEQUENCES TO samah;

-- Log success
DO $$
BEGIN
    RAISE NOTICE 'Samah Store database initialized successfully';
END $$;
