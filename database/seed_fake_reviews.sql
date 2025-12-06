-- Seed fake reviews for all books
-- Each book will get 2-3 fake reviews with random ratings and reviews

USE perpustakaan;

-- Create temporary fake users for reviews (or use existing users if available)
-- We'll use a system user ID or create fake user entries
-- For simplicity, we'll use user_id = 0 or create a special "System" user

-- First, let's check if we have any users, if not create a system user
SET @system_user_id = NULL;
SELECT id INTO @system_user_id FROM users LIMIT 1;

-- If no users exist, create a system user for fake reviews
-- Otherwise, we'll use random user IDs from existing users
SET @fake_user_count = (SELECT COUNT(*) FROM users);

-- Sample fake review texts in Indonesian
-- We'll use these templates to generate varied reviews

-- Function to get random rating (weighted towards positive ratings)
-- 5 stars: 40%, 4 stars: 30%, 3 stars: 20%, 2 stars: 7%, 1 star: 3%

-- Insert fake reviews for each book
-- We'll generate 2-3 reviews per book with varied ratings

-- Sample review templates
SET @review_templates = '[
  "Buku yang sangat menarik! Ceritanya mengalir dengan baik dan karakter-karakternya sangat hidup.",
  "Saya sangat menikmati membaca buku ini. Plotnya tidak terduga dan membuat saya terus membaca sampai selesai.",
  "Buku yang bagus untuk dibaca. Penulisnya memiliki gaya menulis yang unik dan menarik.",
  "Ceritanya cukup menarik meskipun ada beberapa bagian yang agak lambat. Overall, buku yang layak dibaca.",
  "Buku ini memberikan perspektif baru tentang topik yang dibahas. Sangat direkomendasikan!",
  "Membaca buku ini adalah pengalaman yang menyenangkan. Saya belajar banyak hal baru.",
  "Plotnya sangat menarik dan karakter-karakternya berkembang dengan baik sepanjang cerita.",
  "Buku yang bagus, tapi ada beberapa bagian yang bisa lebih detail lagi.",
  "Saya suka cara penulis menyampaikan pesan dalam buku ini. Sangat inspiratif!",
  "Buku ini layak untuk dibaca. Meskipun tidak sempurna, tapi cukup menghibur.",
  "Ceritanya sangat menarik dari awal sampai akhir. Tidak ada bagian yang membosankan.",
  "Buku yang bagus dengan karakter-karakter yang kuat. Plotnya juga tidak mudah ditebak.",
  "Saya sangat merekomendasikan buku ini untuk semua orang yang suka membaca.",
  "Buku ini memberikan wawasan baru yang sangat berharga. Sangat bermanfaat!",
  "Ceritanya mengalir dengan baik dan mudah diikuti. Karakter-karakternya juga sangat relatable.",
  "Buku yang bagus, meskipun ada beberapa bagian yang agak membingungkan.",
  "Saya menikmati setiap halaman dari buku ini. Sangat menghibur dan informatif.",
  "Plotnya sangat menarik dan membuat saya penasaran sampai akhir cerita.",
  "Buku ini memberikan perspektif yang berbeda tentang topik yang sudah familiar.",
  "Sangat direkomendasikan! Buku ini layak untuk dibaca berulang kali."
]';

-- We'll use a stored procedure approach or direct INSERT statements
-- For simplicity, let's create fake reviews directly

-- Get all book IDs
-- Then for each book, insert 2-3 fake reviews

-- Since we can't easily loop in MySQL without stored procedures,
-- we'll create a script that generates INSERT statements for all books

-- For each book, we'll insert reviews with:
-- - Random user_id from existing users (or use a default)
-- - NULL borrowing_id (indicating fake review)
-- - Random rating (weighted towards positive)
-- - Random review text from templates

-- Note: This is a template. You'll need to run this after ensuring you have users in the database
-- Or modify it to create fake users first

-- Let's create a simpler approach: insert fake reviews using a cursor-like approach
-- But MySQL doesn't support cursors in regular SQL scripts easily
-- So we'll use a different approach: generate INSERT statements for each book

-- First, ensure we have at least one user to use for fake reviews
-- If not, we'll need to handle this differently

-- For now, let's assume we have users and create fake reviews
-- We'll use a stored procedure or generate SQL programmatically

-- Alternative: Create a Node.js script to do this, but for SQL-only solution:
-- We can use a temporary table approach

-- Create temporary table with fake review data
CREATE TEMPORARY TABLE IF NOT EXISTS temp_fake_reviews (
    book_id INT,
    user_id INT,
    rating INT,
    review_text TEXT
);

-- Since we can't easily generate this in pure SQL without stored procedures,
-- We'll create a Node.js script instead to generate and insert fake reviews
-- But for now, here's a SQL template that can be used:

-- Example INSERT statements (you would generate these for all 150 books):
-- INSERT INTO reviews (book_id, user_id, borrowing_id, rating, review) VALUES
-- (1, 1, NULL, 5, 'Buku yang sangat menarik! Ceritanya mengalir dengan baik dan karakter-karakternya sangat hidup.'),
-- (1, 2, NULL, 4, 'Saya sangat menikmati membaca buku ini. Plotnya tidak terduga dan membuat saya terus membaca sampai selesai.'),
-- (1, 3, NULL, 5, 'Buku ini memberikan perspektif baru tentang topik yang dibahas. Sangat direkomendasikan!');

-- Note: This file serves as a template. The actual seed data will be generated by a Node.js script.

