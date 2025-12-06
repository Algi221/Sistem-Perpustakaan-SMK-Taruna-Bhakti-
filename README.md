# Sistem Manajemen Perpustakaan

Sistem manajemen perpustakaan modern dengan Next.js, NextAuth, dan MySQL.

## Fitur

### Untuk Siswa/Umum
- Registrasi dan login
- Melihat daftar buku
- Melihat detail buku
- Meminjam buku (mengirim request dengan durasi 2 minggu - 1 bulan)
- Melihat riwayat peminjaman
- **Halaman Profil** dengan:
  - Upload foto profil (local storage)
  - Kalender peminjaman (lihat jadwal pinjam & jatuh tempo)
  - History peminjaman (buku yang sudah dikembalikan)
  - Ubah password
  - Ubah email

### Untuk Petugas
- Login sebagai petugas
- CRUD (Create, Read, Update, Delete) data buku
- Melihat dan menyetujui/menolak permintaan peminjaman
- Mengelola peminjaman aktif
- Menandai buku sebagai dikembalikan

### Untuk Admin
- Login sebagai admin
- Membuat akun petugas baru
- Mengelola user (menghapus akun user)
- Reset password user yang lupa password

## Teknologi yang Digunakan

- **Next.js 16** - Framework React
- **NextAuth** - Authentication
- **MySQL** - Database
- **Tailwind CSS** - Styling
- **bcryptjs** - Password hashing

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd perpustakaan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

1. Buat database MySQL dengan nama `perpustakaan` atau sesuaikan dengan konfigurasi Anda.

2. Import file SQL:
   ```bash
   mysql -u root -p perpustakaan < database/schema.sql
   ```
   
   Atau menggunakan phpMyAdmin:
   - Buka phpMyAdmin
   - Pilih database `perpustakaan` (atau buat baru)
   - Klik tab "Import"
   - Pilih file `database/schema.sql`
   - Klik "Go"

3. File `database/schema.sql` berisi:
   - Struktur tabel (users, staff, admin, books, borrowings)
   - 150 data buku dari berbagai genre
   - Akun admin default:
     - Email: `admin@perpustakaan.com`
     - Password: `admin123`

4. **Update Database untuk Profile Image** (jika belum ada):
   ```sql
   ALTER TABLE users ADD COLUMN profile_image VARCHAR(500) DEFAULT NULL AFTER address;
   ```
   
   Atau jalankan file SQL:
   ```bash
   mysql -u root -p perpustakaan < database/add_profile_image.sql
   ```

### 4. Konfigurasi Environment Variables

Buat file `.env.local` di root project:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=perpustakaan

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
```

**Penting:** Ganti `NEXTAUTH_SECRET` dengan secret key yang aman. Anda bisa generate dengan:
```bash
openssl rand -base64 32
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Struktur Database

### Tabel Users (Siswa/Umum)
- `id` - Primary key
- `name` - Nama lengkap
- `email` - Email (unique)
- `password` - Password (hashed)
- `role` - 'siswa' atau 'umum'
- `phone` - No. telepon
- `address` - Alamat
- `created_at`, `updated_at` - Timestamps

### Tabel Staff (Petugas)
- `id` - Primary key
- `name` - Nama lengkap
- `email` - Email (unique)
- `password` - Password (hashed)
- `phone` - No. telepon
- `created_at`, `updated_at` - Timestamps

### Tabel Admin
- `id` - Primary key
- `name` - Nama
- `email` - Email (unique)
- `password` - Password (hashed)
- `created_at`, `updated_at` - Timestamps

### Tabel Books
- `id` - Primary key
- `title` - Judul buku
- `author` - Penulis
- `isbn` - ISBN
- `genre` - Genre
- `description` - Deskripsi
- `image_url` - URL gambar
- `stock` - Total stok
- `available` - Stok tersedia
- `published_year` - Tahun terbit
- `publisher` - Penerbit
- `created_at`, `updated_at` - Timestamps

### Tabel Borrowings
- `id` - Primary key
- `user_id` - Foreign key ke users
- `book_id` - Foreign key ke books
- `borrow_date` - Tanggal pinjam
- `return_date` - Tanggal kembali
- `due_date` - Tanggal jatuh tempo
- `status` - 'pending', 'approved', 'borrowed', 'returned', 'rejected'
- `staff_id` - Foreign key ke staff (yang approve)
- `notes` - Catatan
- `created_at`, `updated_at` - Timestamps

## Query SQL Penting

### 📚 Query Buku

#### Melihat semua buku
```sql
SELECT 
    id,
    title,
    author,
    genre,
    stock,
    available,
    published_year
FROM books 
ORDER BY created_at DESC;
```

#### Mencari buku berdasarkan judul atau penulis
```sql
SELECT 
    id,
    title,
    author,
    genre,
    available
FROM books 
WHERE title LIKE '%kata kunci%' 
   OR author LIKE '%kata kunci%'
ORDER BY title;
```

#### Melihat buku berdasarkan genre
```sql
SELECT 
    id,
    title,
    author,
    stock,
    available
FROM books 
WHERE genre = 'Fiction'
ORDER BY title;
```

#### Melihat buku yang tersedia
```sql
SELECT 
    id,
    title,
    author,
    genre,
    available,
    stock
FROM books 
WHERE available > 0
ORDER BY title;
```

#### Statistik buku per genre
```sql
SELECT 
    genre,
    COUNT(*) as total_buku,
    SUM(stock) as total_stok,
    SUM(available) as total_tersedia
FROM books
GROUP BY genre
ORDER BY total_buku DESC;
```

### 👥 Query User & Staff

#### Melihat semua user
```sql
SELECT 
    id,
    name,
    email,
    role,
    phone,
    created_at
FROM users
ORDER BY created_at DESC;
```

#### Melihat semua staff
```sql
SELECT 
    id,
    name,
    email,
    phone,
    created_at
FROM staff
ORDER BY created_at DESC;
```

### 📖 Query Peminjaman

#### Melihat semua peminjaman pending (untuk petugas)
```sql
SELECT 
    b.id,
    b.borrow_date,
    b.due_date,
    b.status,
    u.name as nama_peminjam,
    u.email as email_peminjam,
    bk.title as judul_buku,
    bk.author as penulis
FROM borrowings b
JOIN users u ON b.user_id = u.id
JOIN books bk ON b.book_id = bk.id
WHERE b.status = 'pending'
ORDER BY b.created_at DESC;
```

#### Melihat riwayat peminjaman user tertentu
```sql
SELECT 
    b.id,
    b.borrow_date,
    b.due_date,
    b.return_date,
    b.status,
    bk.title,
    bk.author,
    bk.genre
FROM borrowings b
JOIN books bk ON b.book_id = bk.id
WHERE b.user_id = 1  -- Ganti dengan ID user
ORDER BY b.created_at DESC;
```

#### Melihat peminjaman aktif (belum dikembalikan)
```sql
SELECT 
    b.id,
    b.borrow_date,
    b.due_date,
    u.name as nama_peminjam,
    bk.title,
    DATEDIFF(b.due_date, CURDATE()) as hari_tersisa
FROM borrowings b
JOIN users u ON b.user_id = u.id
JOIN books bk ON b.book_id = bk.id
WHERE b.status IN ('approved', 'borrowed')
ORDER BY b.due_date ASC;
```

#### Melihat peminjaman yang sudah lewat jatuh tempo
```sql
SELECT 
    b.id,
    b.borrow_date,
    b.due_date,
    u.name as nama_peminjam,
    u.email,
    bk.title,
    DATEDIFF(CURDATE(), b.due_date) as hari_terlambat
FROM borrowings b
JOIN users u ON b.user_id = u.id
JOIN books bk ON b.book_id = bk.id
WHERE b.status IN ('approved', 'borrowed')
  AND b.due_date < CURDATE()
ORDER BY b.due_date ASC;
```

#### Statistik peminjaman per status
```sql
SELECT 
    status,
    COUNT(*) as jumlah
FROM borrowings
GROUP BY status
ORDER BY jumlah DESC;
```

### 🔧 Query Admin

#### Reset password user (dari admin)
```sql
-- Password akan di-hash oleh aplikasi
-- Jangan jalankan query ini langsung, gunakan API endpoint
UPDATE users 
SET password = ?  -- Password yang sudah di-hash
WHERE id = ?;
```

#### Menghapus user (dari admin)
```sql
-- Hati-hati: ini akan menghapus semua data terkait user
DELETE FROM users 
WHERE id = ?;
```

#### Melihat semua admin
```sql
SELECT 
    id,
    name,
    email,
    created_at
FROM admin
ORDER BY created_at DESC;
```

### 📊 Query Statistik

#### Statistik keseluruhan perpustakaan
```sql
SELECT 
    (SELECT COUNT(*) FROM books) as total_buku,
    (SELECT COUNT(*) FROM users) as total_user,
    (SELECT COUNT(*) FROM staff) as total_staff,
    (SELECT COUNT(*) FROM borrowings WHERE status = 'pending') as peminjaman_pending,
    (SELECT COUNT(*) FROM borrowings WHERE status = 'borrowed') as buku_dipinjam,
    (SELECT SUM(available) FROM books) as total_buku_tersedia;
```

#### Buku paling banyak dipinjam
```sql
SELECT 
    bk.id,
    bk.title,
    bk.author,
    COUNT(b.id) as jumlah_peminjaman
FROM books bk
LEFT JOIN borrowings b ON bk.id = b.book_id
GROUP BY bk.id, bk.title, bk.author
ORDER BY jumlah_peminjaman DESC
LIMIT 10;
```

#### User paling aktif meminjam
```sql
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(b.id) as jumlah_peminjaman
FROM users u
LEFT JOIN borrowings b ON u.id = b.user_id
GROUP BY u.id, u.name, u.email
ORDER BY jumlah_peminjaman DESC
LIMIT 10;
```

## Default Login

### Admin
- Email: `admin@perpustakaan.com`
- Password: `admin123`

**PENTING:** Ganti password admin setelah pertama kali login!

## Struktur Folder

```
perpustakaan/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   ├── books/        # Book CRUD
│   │   ├── borrowings/   # Borrowing management
│   │   └── admin/        # Admin routes
│   ├── admin/            # Admin pages
│   ├── staff/            # Staff pages
│   ├── dashboard/        # User dashboard
│   ├── books/            # Book pages
│   ├── login/            # Login page
│   └── register/         # Register page
├── components/           # React components
├── lib/                  # Utilities (db connection)
├── database/             # SQL schema
└── public/               # Static files
```

## Catatan Penting

1. **Password Hashing**: Semua password di-hash menggunakan bcrypt dengan cost factor 10.

2. **Authentication**: 
   - Admin: Login langsung dari database
   - Staff & Users: Menggunakan NextAuth

3. **Authorization**: Middleware memastikan hanya user yang berwenang yang bisa mengakses halaman tertentu.

4. **Database**: Pastikan MySQL sudah berjalan sebelum menjalankan aplikasi.

5. **Environment Variables**: Jangan commit file `.env.local` ke repository.

## Troubleshooting

### Error: "Cannot connect to database"
- Pastikan MySQL sudah berjalan
- Periksa konfigurasi di `.env.local`
- Pastikan database `perpustakaan` sudah dibuat

### Error: "NextAuth secret is missing"
- Pastikan `NEXTAUTH_SECRET` sudah di-set di `.env.local`

### Error: "Table doesn't exist"
- Pastikan sudah import file `database/schema.sql`

## License

MIT
