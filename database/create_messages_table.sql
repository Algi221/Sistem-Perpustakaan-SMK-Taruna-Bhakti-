-- Create messages table for Perpustakaan (Library Management System)
-- This table stores messages/notifications between users and staff

USE perpustakaan;

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    borrowing_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role ENUM('user', 'staff', 'admin', 'system') NOT NULL,
    receiver_id INT NOT NULL,
    receiver_role ENUM('user', 'staff', 'admin') NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'error', 'success', 'cancellation_reason') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (borrowing_id) REFERENCES borrowings(id) ON DELETE CASCADE,
    INDEX idx_borrowing_id (borrowing_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


