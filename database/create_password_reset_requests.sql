-- Table untuk password reset requests
-- User request reset password → admin approve → user reset password

USE perpustakaan;

CREATE TABLE IF NOT EXISTS password_reset_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_type ENUM('user', 'staff', 'admin') NOT NULL,
    verification_token VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'expired') DEFAULT 'pending',
    admin_id INT NULL,
    admin_approved_at DATETIME NULL,
    admin_note TEXT NULL,
    reset_token VARCHAR(255) NULL,
    reset_completed_at DATETIME NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_verification_token (verification_token),
    INDEX idx_reset_token (reset_token),
    INDEX idx_status (status),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;







