-- Test data untuk pembayaran denda
-- User: Algi Nonchalant, terlambat 1 hari (denda Rp 2.000)

USE perpustakaan;

-- Step 1: Cari user Algi Nonchalant
SELECT id, name, email FROM users WHERE name LIKE '%Algi%' OR name LIKE '%Nonchalant%' OR email LIKE '%algi%';

-- Step 2: Pastikan ada buku di database
SELECT id, title FROM books LIMIT 5;

-- Step 3: Buat/Update borrowing untuk test
-- Pilih salah satu option di bawah:

-- ============================================
-- OPTION 1: Update borrowing yang sudah ada
-- ============================================
-- Update borrowing yang sudah returned menjadi terlambat 1 hari
UPDATE borrowings 
SET 
    due_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY),  -- Jatuh tempo kemarin
    return_date = CURDATE(),                         -- Dikembalikan hari ini
    status = 'returned',
    fine_amount = 2000,                              -- Denda hari 1 = Rp 2.000
    fine_days = 1,
    fine_paid = FALSE,
    fine_paid_at = NULL,
    xendit_invoice_id = NULL,
    xendit_payment_status = NULL,
    updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE (name LIKE '%Algi%' OR name LIKE '%Nonchalant%' OR email LIKE '%algi%') LIMIT 1)
AND status = 'returned'
ORDER BY id DESC
LIMIT 1;

-- ============================================
-- OPTION 2: Buat borrowing baru untuk test
-- ============================================
-- Uncomment script di bawah jika ingin buat borrowing baru
/*
INSERT INTO borrowings (
    user_id, 
    book_id, 
    borrow_date, 
    due_date, 
    return_date, 
    status, 
    fine_amount, 
    fine_days, 
    fine_paid,
    created_at,
    updated_at
) 
SELECT 
    u.id as user_id,
    (SELECT id FROM books ORDER BY id DESC LIMIT 1) as book_id,  -- Ambil buku terakhir
    DATE_SUB(CURDATE(), INTERVAL 8 DAY) as borrow_date,  -- Pinjam 8 hari lalu
    DATE_SUB(CURDATE(), INTERVAL 1 DAY) as due_date,     -- Jatuh tempo kemarin (terlambat 1 hari)
    CURDATE() as return_date,                             -- Dikembalikan hari ini
    'returned' as status,
    2000 as fine_amount,                                  -- Denda 1 hari = Rp 2.000
    1 as fine_days,
    FALSE as fine_paid,
    NOW() as created_at,
    NOW() as updated_at
FROM users u
WHERE (u.name LIKE '%Algi%' OR u.name LIKE '%Nonchalant%' OR u.email LIKE '%algi%')
LIMIT 1;
*/

-- Step 4: Cek hasil - Pastikan data sudah benar
SELECT 
    b.id as borrowing_id,
    u.name as user_name,
    u.email,
    bk.title as book_title,
    b.borrow_date,
    b.due_date,
    b.return_date,
    b.status,
    b.fine_amount,
    b.fine_days,
    b.fine_paid,
    DATEDIFF(b.return_date, b.due_date) as days_late,
    CASE 
        WHEN DATEDIFF(b.return_date, b.due_date) > 0 THEN 'TERLAMBAT'
        ELSE 'TIDAK TERLAMBAT'
    END as status_denda
FROM borrowings b
JOIN users u ON b.user_id = u.id
JOIN books bk ON b.book_id = bk.id
WHERE (u.name LIKE '%Algi%' OR u.name LIKE '%Nonchalant%' OR u.email LIKE '%algi%')
ORDER BY b.id DESC
LIMIT 10;

-- Step 5: Verifikasi perhitungan denda
-- Denda harusnya: Rp 2.000 (hari 1)
SELECT 
    b.id,
    u.name,
    bk.title,
    b.fine_days as hari_terlambat,
    b.fine_amount as denda,
    CASE 
        WHEN b.fine_days = 1 THEN 2000
        WHEN b.fine_days = 2 THEN 4000
        WHEN b.fine_days = 3 THEN 8000
        ELSE 'Check formula'
    END as denda_seharusnya
FROM borrowings b
JOIN users u ON b.user_id = u.id
JOIN books bk ON b.book_id = bk.id
WHERE (u.name LIKE '%Algi%' OR u.name LIKE '%Nonchalant%' OR u.email LIKE '%algi%')
AND b.fine_amount > 0
ORDER BY b.id DESC;
