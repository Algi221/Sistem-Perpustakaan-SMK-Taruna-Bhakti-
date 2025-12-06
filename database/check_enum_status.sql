-- Check current enum values for xendit_payment_status
-- Run this to see what enum values are currently available

USE perpustakaan;

-- Check current column definition
SHOW COLUMNS FROM borrowings WHERE Field = 'xendit_payment_status';

-- If pending_verification is not in the enum, you need to run:
-- database/add_fine_verification_simple.sql

