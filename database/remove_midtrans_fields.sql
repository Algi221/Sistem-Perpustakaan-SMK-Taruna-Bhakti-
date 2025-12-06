-- Remove Midtrans-related fields from borrowings table
-- Keep fine_amount, fine_days, fine_paid, fine_paid_at (still needed)
-- Remove payment_order_id and payment_status (will use Xendit instead)

USE perpustakaan;

-- Remove Midtrans-specific fields
ALTER TABLE borrowings 
DROP COLUMN IF EXISTS payment_order_id,
DROP COLUMN IF EXISTS payment_status;

-- Add Xendit fields
ALTER TABLE borrowings 
ADD COLUMN xendit_invoice_id VARCHAR(255) NULL AFTER fine_paid_at,
ADD COLUMN xendit_payment_status ENUM('pending', 'paid', 'expired', 'failed') DEFAULT NULL AFTER xendit_invoice_id;

-- Create index for Xendit queries
CREATE INDEX IF NOT EXISTS idx_xendit_invoice_id ON borrowings(xendit_invoice_id);

