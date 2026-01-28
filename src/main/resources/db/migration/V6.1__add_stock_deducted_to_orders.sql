-- Add stockDeducted column to orders table
ALTER TABLE store.orders
ADD COLUMN stock_deducted BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing orders: if status is DELIVERED, mark as stock deducted
UPDATE store.orders
SET stock_deducted = TRUE
WHERE status = 'DELIVERED';

-- Add comment
COMMENT ON COLUMN store.orders.stock_deducted IS 'Flag to track if inventory stock has been deducted for this order (idempotency)';

