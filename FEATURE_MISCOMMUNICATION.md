# Fitur Pencegahan Miskomunikasi

Fitur ini mencegah miskomunikasi antara petugas dan user dengan:
1. **Otomatis membatalkan peminjaman** yang pending lebih dari 1 jam
2. **Meminta alasan dari petugas** untuk setiap pembatalan
3. **Mengirimkan alasan ke user** melalui sistem pesan/notifikasi

## Setup Database

Jalankan SQL berikut untuk membuat tabel messages:

```sql
-- File: database/create_messages_table.sql
USE perpustakaan;

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
```

## Setup Cron Job

### Opsi 1: Menggunakan Vercel Cron (Recommended)

Tambahkan ke `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/check-expired-borrowings",
    "schedule": "*/5 * * * *"
  }]
}
```

Dan set environment variable `CRON_SECRET` di Vercel.

### Opsi 2: Menggunakan External Cron Service

Setup cron job untuk memanggil endpoint setiap 5 menit:

```bash
*/5 * * * * curl -X GET "https://your-domain.com/api/cron/check-expired-borrowings" -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Opsi 3: Manual Testing

Jalankan script secara manual:

```bash
node scripts/check-expired-borrowings.js
```

Atau panggil API langsung:

```bash
curl -X POST http://localhost:3000/api/borrowings/check-expired
```

## Cara Kerja

1. **Peminjaman Pending > 1 Jam**
   - Sistem otomatis mengecek peminjaman yang pending lebih dari 1 jam
   - Status diubah menjadi 'rejected'
   - Notifikasi dikirim ke user bahwa peminjaman dibatalkan

2. **Petugas Mengisi Alasan**
   - Petugas melihat daftar peminjaman yang perlu alasan di halaman Permintaan
   - Klik "Beri Alasan" untuk mengisi alasan pembatalan
   - Alasan dikirim ke user melalui sistem pesan

3. **User Menerima Alasan**
   - User menerima notifikasi di kanan bawah
   - User bisa membuka Message Center untuk melihat semua pesan
   - Pesan ditandai sebagai "Baru" jika belum dibaca

## API Endpoints

### 1. Check Expired Borrowings
- **POST** `/api/borrowings/check-expired` - Manual check (staff/admin only)
- **GET** `/api/borrowings/check-expired` - Get list pending reasons (staff/admin only)
- **GET** `/api/cron/check-expired-borrowings` - Cron job endpoint

### 2. Submit Cancellation Reason
- **POST** `/api/borrowings/[id]/cancel-reason` - Staff mengisi alasan pembatalan

### 3. Messages
- **GET** `/api/messages` - Get all messages for current user
- **POST** `/api/messages` - Send new message
- **PATCH** `/api/messages` - Mark messages as read

## Komponen UI

1. **CancellationReasons** (`components/staff/CancellationReasons.jsx`)
   - Menampilkan daftar peminjaman yang perlu alasan
   - Modal untuk mengisi alasan pembatalan

2. **MessageCenter** (`components/MessageCenter.jsx`)
   - Pusat pesan untuk user
   - Menampilkan semua pesan yang belum dibaca
   - Button floating di kanan bawah

3. **NotificationToast** (Updated)
   - Menampilkan notifikasi termasuk pesan pembatalan

## Testing

1. Buat peminjaman baru (status: pending)
2. Tunggu lebih dari 1 jam (atau ubah `created_at` di database)
3. Jalankan cron job atau panggil API check-expired
4. Cek di halaman Permintaan - harus muncul di bagian "Peminjaman yang Perlu Alasan"
5. Klik "Beri Alasan" dan isi alasan
6. Cek di user - harus menerima notifikasi dan pesan


