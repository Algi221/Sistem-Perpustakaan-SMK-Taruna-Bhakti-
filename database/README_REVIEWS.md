# Setup Reviews & Ratings System

File-file ini digunakan untuk setup sistem review dan rating untuk semua buku.

## Langkah-langkah Setup

### 1. Update Tabel Reviews

Jalankan SQL migration untuk mengubah tabel `reviews` agar mendukung fake reviews (borrowing_id bisa NULL):

```bash
mysql -u root -p perpustakaan < database/update_reviews_table_for_fake_reviews.sql
```

Atau jalankan langsung di MySQL:

```sql
USE perpustakaan;
ALTER TABLE reviews MODIFY COLUMN borrowing_id INT NULL;
ALTER TABLE reviews DROP INDEX unique_user_book_review;
```

### 2. Seed Fake Reviews

Jalankan script Node.js untuk menambahkan 2-3 fake reviews untuk setiap buku:

```bash
node database/seed-fake-reviews.js
```

Script ini akan:
- Membuat fake users jika belum ada users di database
- Menambahkan 2-3 fake reviews untuk setiap buku
- Menggunakan rating yang bervariasi (dengan bobot lebih banyak ke rating positif)
- Menggunakan review text dalam bahasa Indonesia

### 3. Verifikasi

Setelah menjalankan seed script, verifikasi dengan:

```sql
-- Lihat jumlah reviews per buku
SELECT 
    b.title,
    COUNT(r.id) as review_count,
    AVG(r.rating) as avg_rating
FROM books b
LEFT JOIN reviews r ON b.id = r.book_id
GROUP BY b.id
ORDER BY review_count DESC
LIMIT 10;

-- Lihat semua fake reviews (borrowing_id IS NULL)
SELECT 
    r.id,
    b.title,
    u.name as reviewer,
    r.rating,
    r.review,
    r.created_at
FROM reviews r
JOIN books b ON r.book_id = b.id
JOIN users u ON r.user_id = u.id
WHERE r.borrowing_id IS NULL
ORDER BY r.created_at DESC
LIMIT 20;
```

## Catatan Penting

1. **Fake Reviews**: Reviews dengan `borrowing_id = NULL` adalah fake reviews yang ditambahkan untuk seed data
2. **Real Reviews**: Reviews dengan `borrowing_id` yang valid adalah reviews dari user yang benar-benar meminjam dan mengembalikan buku
3. **Rating Calculation**: Rating rata-rata dihitung dari semua reviews (baik fake maupun real)
4. **User Reviews**: User asli masih bisa menambahkan review setelah mengembalikan buku melalui sistem yang sudah ada

## Troubleshooting

Jika terjadi error saat menjalankan seed script:

1. Pastikan database connection settings di `.env.local` sudah benar
2. Pastikan tabel `books` dan `users` sudah ada
3. Pastikan migration untuk `reviews` table sudah dijalankan
4. Pastikan `mysql2` package sudah terinstall: `npm install mysql2`

