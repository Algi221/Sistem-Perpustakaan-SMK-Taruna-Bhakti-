-- Add profile_image column to admin and staff tables
-- This allows admin and staff to upload profile pictures

USE perpustakaan;

-- Add profile_image column to admin table
-- Note: If column already exists, you'll get an error - just ignore it
ALTER TABLE admin ADD COLUMN profile_image VARCHAR(500) DEFAULT NULL AFTER password;

-- Add profile_image column to staff table
-- Note: If column already exists, you'll get an error - just ignore it
ALTER TABLE staff ADD COLUMN profile_image VARCHAR(500) DEFAULT NULL AFTER password;


