-- Update fine system: Remove Midtrans fields, add Xendit fields
-- Run this if you already ran add_fine_system.sql with Midtrans fields

USE perpustakaan;

-- Remove Midtrans fields if they exist
ALTER TABLE borrowings 
DROP COLUMN IF EXISTS payment_order_id,
DROP COLUMN IF EXISTS payment_status;

-- Add Xendit fields (if not exists)
-- Check if columns exist first, if not add them
ALTER TABLE borrowings 
ADD COLUMN IF NOT EXISTS xendit_invoice_id VARCHAR(255) NULL AFTER fine_paid_at,
ADD COLUMN IF NOT EXISTS xendit_payment_status ENUM('pending', 'paid', 'expired', 'failed') DEFAULT NULL AFTER xendit_invoice_id;

-- Drop old index if exists
DROP INDEX IF EXISTS idx_payment_order_id ON borrowings;

-- Create index for Xendit queries
CREATE INDEX IF NOT EXISTS idx_xendit_invoice_id ON borrowings(xendit_invoice_id);
CREATE INDEX IF NOT EXISTS idx_fine_paid ON borrowings(fine_paid);

