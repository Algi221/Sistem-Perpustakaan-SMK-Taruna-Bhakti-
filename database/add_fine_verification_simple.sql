-- Add fine verification system for staff (Simple version)
-- This allows staff to manually verify fine payments
-- Run this if the complex version doesn't work

USE perpustakaan;

-- Update xendit_payment_status enum to include 'pending_verification'
ALTER TABLE borrowings 
MODIFY COLUMN xendit_payment_status ENUM('pending', 'paid', 'pending_verification', 'expired', 'failed', 'rejected') DEFAULT NULL;

-- Add columns for staff verification
-- Note: Remove these lines if columns already exist to avoid errors
ALTER TABLE borrowings 
ADD COLUMN fine_verified_by INT NULL AFTER fine_paid_at;

ALTER TABLE borrowings 
ADD COLUMN fine_verified_at DATETIME NULL AFTER fine_verified_by;

ALTER TABLE borrowings 
ADD COLUMN fine_verification_note TEXT NULL AFTER fine_verified_at;

-- Create index for faster queries
CREATE INDEX idx_fine_verification ON borrowings(xendit_payment_status, fine_paid);

