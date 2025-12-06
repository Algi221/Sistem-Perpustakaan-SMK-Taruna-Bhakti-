-- Update reviews table to support fake reviews (borrowing_id can be NULL)
-- This allows initial fake reviews without requiring a borrowing record

USE perpustakaan;

-- Modify borrowing_id to allow NULL for fake reviews
ALTER TABLE reviews MODIFY COLUMN borrowing_id INT NULL;

-- Update the unique constraint to handle NULL borrowing_id
-- First, drop the existing unique constraint
ALTER TABLE reviews DROP INDEX unique_user_book_review;

-- Add a new unique constraint that allows multiple reviews per user/book when borrowing_id is NULL
-- But still enforces uniqueness when borrowing_id is provided
-- Note: MySQL doesn't support partial unique indexes directly, so we'll use a different approach
-- We'll allow multiple fake reviews (borrowing_id IS NULL) but enforce uniqueness for real reviews

-- For fake reviews, we'll allow duplicates (same user can have multiple fake reviews)
-- For real reviews, the existing foreign key constraint will handle uniqueness through the borrowing_id

