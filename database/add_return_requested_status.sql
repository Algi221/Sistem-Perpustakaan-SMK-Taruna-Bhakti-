-- Add 'return_requested' status to borrowings table
-- This allows users to request return, and staff must confirm

USE perpustakaan;

-- Update the ENUM to include 'return_requested'
ALTER TABLE borrowings MODIFY COLUMN status ENUM('pending', 'approved', 'borrowed', 'return_requested', 'returned', 'rejected') DEFAULT 'pending';

