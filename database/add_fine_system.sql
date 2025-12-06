-- Add fine system to borrowings table
-- Fine calculation: Day 1 = 2000, Day 2 = 4000, Day 3 = 8000, etc (multiplied by 2 each day)

USE perpustakaan;

-- Add fine-related columns to borrowings table
ALTER TABLE borrowings 
ADD COLUMN fine_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER notes,
ADD COLUMN fine_days INT DEFAULT 0 AFTER fine_amount,
ADD COLUMN fine_paid BOOLEAN DEFAULT FALSE AFTER fine_days,
ADD COLUMN fine_paid_at TIMESTAMP NULL AFTER fine_paid,
ADD COLUMN xendit_invoice_id VARCHAR(255) NULL AFTER fine_paid_at,
ADD COLUMN xendit_payment_status ENUM('pending', 'paid', 'expired', 'failed') DEFAULT NULL AFTER xendit_invoice_id;

-- Create index for payment queries
CREATE INDEX idx_xendit_invoice_id ON borrowings(xendit_invoice_id);
CREATE INDEX idx_fine_paid ON borrowings(fine_paid);

