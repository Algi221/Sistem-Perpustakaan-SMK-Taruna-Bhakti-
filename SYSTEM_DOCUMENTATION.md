# 📚 Dokumentasi Lengkap Sistem Perpustakaan

## 📋 Daftar Isi
1. [Overview Sistem](#overview-sistem)
2. [Arsitektur & Teknologi](#arsitektur--teknologi)
3. [Database Schema & Relasi](#database-schema--relasi)
4. [Entitas & Fitur](#entitas--fitur)
5. [Algoritma & Business Logic](#algoritma--business-logic)
6. [Library & Dependencies](#library--dependencies)
7. [Credentials & Konfigurasi](#credentials--konfigurasi)
8. [Flow Diagram & Alur Kerja](#flow-diagram--alur-kerja)

---

## 🎯 Overview Sistem

Sistem Perpustakaan adalah aplikasi web berbasis Next.js untuk mengelola peminjaman buku, dengan 3 entitas utama:
- **Users (Siswa/Umum)**: Peminjam buku
- **Staff (Petugas)**: Mengelola peminjaman dan verifikasi
- **Admin**: Mengelola seluruh sistem

---

## 🏗️ Arsitektur & Teknologi

### Stack Teknologi
- **Frontend**: Next.js 16.0.3 (React 19.2.0)
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: MySQL (mysql2)
- **Authentication**: NextAuth.js v5 (JWT)
- **Styling**: Tailwind CSS 4.1.17
- **Animations**: Framer Motion 12.23.24, GSAP 3.13.0,React Bits
- **Payment Gateway**: Xendit
- **Password Hashing**: bcryptjs 3.0.3

### Arsitektur Aplikasi
```
perpustakaan/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes (Backend)
│   ├── siswa/              # User Pages
│   ├── petugas/           # Staff Pages
│   ├── admin/             # Admin Pages
│   └── payment/           # Payment Pages
├── components/             # React Components
│   ├── admin/             # Admin Components
│   ├── staff/             # Staff Components
│   ├── borrowings/        # Borrowing Components
│   ├── books/             # Book Components
│   └── layout/             # Layout Components
├── lib/                    # Utility Libraries
│   ├── db.js              # Database Connection
│   ├── auth.js            # Auth Helpers
│   ├── fineCalculator.js  # Fine Calculation
│   └── xendit.js          # Payment Integration
└── database/              # SQL Migrations
```

---

## 🗄️ Database Schema & Relasi

### Tabel Utama

#### 1. **users** (Siswa/Umum)
```sql
- id (PK, INT, AUTO_INCREMENT)
- name (VARCHAR(255))
- email (VARCHAR(255), UNIQUE)
- password (VARCHAR(255), bcrypt hashed)
- role (ENUM: 'siswa', 'umum')
- phone (VARCHAR(20))
- address (TEXT)
- profile_image (VARCHAR(500))
- created_at, updated_at (TIMESTAMP)
```

#### 2. **staff** (Petugas)
```sql
- id (PK, INT, AUTO_INCREMENT)
- name (VARCHAR(255))
- email (VARCHAR(255), UNIQUE)
- password (VARCHAR(255), bcrypt hashed)
- phone (VARCHAR(20))
- profile_image (VARCHAR(500))
- created_at, updated_at (TIMESTAMP)
```

#### 3. **admin**
```sql
- id (PK, INT, AUTO_INCREMENT)
- name (VARCHAR(255))
- email (VARCHAR(255), UNIQUE)
- password (VARCHAR(255), bcrypt hashed)
- profile_image (VARCHAR(500))
- created_at, updated_at (TIMESTAMP)
```

#### 4. **books**
```sql
- id (PK, INT, AUTO_INCREMENT)
- title (VARCHAR(500))
- author (VARCHAR(255))
- isbn (VARCHAR(50))
- genre (VARCHAR(100))
- description (TEXT)
- image_url (VARCHAR(500))
- stock (INT, DEFAULT 0)          # Total stok
- available (INT, DEFAULT 0)     # Stok tersedia
- published_year (INT)
- publisher (VARCHAR(255))
- created_at, updated_at (TIMESTAMP)
```

#### 5. **borrowings** (Peminjaman)
```sql
- id (PK, INT, AUTO_INCREMENT)
- user_id (FK → users.id)
- book_id (FK → books.id)
- borrow_date (DATE)
- return_date (DATE, NULL)
- due_date (DATE)
- status (ENUM: 'pending', 'approved', 'borrowed', 'return_requested', 'returned', 'rejected')
- staff_id (FK → staff.id, NULL)
- notes (TEXT)
- fine_amount (DECIMAL(10,2), DEFAULT 0)
- fine_days (INT, DEFAULT 0)
- fine_paid (BOOLEAN, DEFAULT FALSE)
- fine_paid_at (DATETIME, NULL)
- xendit_invoice_id (VARCHAR(255), NULL)
- xendit_payment_status (ENUM: 'pending', 'pending_verification', 'paid', 'expired', 'failed', 'rejected')
- fine_verified_by (INT, NULL)    # staff.id atau admin.id
- fine_verified_at (DATETIME, NULL)
- fine_verification_note (TEXT, NULL)
- created_at, updated_at (TIMESTAMP)
```

#### 6. **favorites**
```sql
- id (PK, INT, AUTO_INCREMENT)
- user_id (FK → users.id)
- book_id (FK → books.id)
- created_at (TIMESTAMP)
- UNIQUE(user_id, book_id)
```

#### 7. **reviews**
```sql
- id (PK, INT, AUTO_INCREMENT)
- book_id (FK → books.id)
- user_id (FK → users.id)
- borrowing_id (FK → borrowings.id)
- rating (INT, 1-5)
- review (TEXT)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(user_id, book_id, borrowing_id)
```

### Relasi Database

```
users (1) ──< (N) borrowings (N) >── (1) books
users (1) ──< (N) favorites (N) >── (1) books
users (1) ──< (N) reviews (N) >── (1) books
staff (1) ──< (N) borrowings
admin (1) ──< (N) borrowings (via fine_verified_by)
```

---

## 👥 Entitas & Fitur

### 1. **Users (Siswa/Umum)**

#### Fitur Utama:
- ✅ **Registrasi & Login**
  - Email & password authentication
  - Role: 'siswa' atau 'umum'
  - Password hashing dengan bcryptjs

- ✅ **Pencarian & Penelusuran Buku**
  - Search by title, author, genre
  - Filter by genre
  - View book details

- ✅ **Peminjaman Buku**
  - Request peminjaman (status: 'pending')
  - View status peminjaman
  - Request pengembalian (status: 'return_requested')
  - View riwayat peminjaman

- ✅ **Favorit Buku**
  - Add/remove buku ke favorit
  - View daftar favorit

- ✅ **Review & Rating**
  - Beri review setelah mengembalikan buku
  - Rating 1-5 bintang

- ✅ **Pembayaran Denda**
  - View denda jika terlambat
  - Bayar denda via Xendit
  - Track status pembayaran

- ✅ **Profil**
  - Edit profil
  - Upload foto profil
  - Change password

#### API Endpoints:
- `POST /api/auth/register` - Registrasi
- `GET /api/books` - List buku
- `GET /api/books/[id]` - Detail buku
- `POST /api/borrowings` - Request peminjaman
- `GET /api/borrowings` - List peminjaman user
- `PATCH /api/borrowings/[id]/return-request` - Request pengembalian
- `POST /api/favorites` - Add/remove favorit
- `POST /api/reviews` - Create review
- `POST /api/payments/create` - Create payment
- `GET /api/payments/status/[orderId]` - Check payment status

---

### 2. **Staff (Petugas)**

#### Fitur Utama:
- ✅ **Login**
  - Email & password authentication
  - Role: 'staff'

- ✅ **Manajemen Peminjaman**
  - View semua request peminjaman (status: 'pending')
  - Approve/reject peminjaman
  - Confirm pickup (status: 'approved' → 'borrowed')
  - Confirm return (status: 'return_requested' → 'returned')
  - Calculate & record fine saat return

- ✅ **Peminjaman Aktif**
  - View semua peminjaman aktif (status: 'borrowed')
  - Track overdue books
  - View fine information

- ✅ **Verifikasi Pembayaran Denda**
  - View pending payments (status: 'pending_verification' atau 'paid' dengan fine_paid = FALSE)
  - Approve/reject pembayaran
  - Set fine_paid = TRUE setelah approve

- ✅ **Notifikasi**
  - Real-time notifications untuk:
    - New borrowing requests
    - Return requests
    - Pending fine payments

- ✅ **Dashboard**
  - Statistik peminjaman
  - Calendar view
  - Recent activities

- ✅ **Profil**
  - Edit profil
  - Upload foto profil
  - Change password

#### API Endpoints:
- `PATCH /api/borrowings/[id]` - Update status peminjaman
- `PATCH /api/borrowings/[id]/pickup` - Confirm pickup
- `PATCH /api/borrowings/[id]/confirm-return` - Confirm return (calculate fine)
- `POST /api/payments/verify/[borrowingId]` - Verify fine payment
- `GET /api/notifications` - Get notifications

---

### 3. **Admin**

#### Fitur Utama:
- ✅ **Login**
  - Email & password authentication
  - Role: 'admin'

- ✅ **Manajemen User**
  - View semua users
  - Create/edit/delete users
  - Reset password users
  - View user statistics

- ✅ **Manajemen Staff**
  - View semua staff
  - Create/edit/delete staff
  - Reset password staff

- ✅ **Manajemen Buku**
  - Create/edit/delete books
  - Update stock & available
  - Upload book images

- ✅ **Dashboard & Monitoring**
  - Activity monitoring (users & staff)
  - User distribution charts
  - Registration growth charts
  - Recent borrowings
  - Recent staff activities

- ✅ **Verifikasi Pembayaran Denda**
  - Same as staff (can verify fine payments)

- ✅ **Profil**
  - Edit profil
  - Upload foto profil
  - Change password

#### API Endpoints:
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `POST /api/admin/users/[id]/reset-password` - Reset password
- `GET /api/admin/staff` - List staff
- `POST /api/admin/staff` - Create staff
- `POST /api/books` - Create book
- `PATCH /api/books/[id]` - Update book
- `DELETE /api/books/[id]` - Delete book

---

## 🧮 Algoritma & Business Logic

### 1. **Algoritma Perhitungan Denda (Exponential Fine)**

**File**: `lib/fineCalculator.js`

#### Formula:
```
Hari 1: Rp 2.000 = 2000 * (2^0)
Hari 2: Rp 4.000 = 2000 * (2^1)
Hari 3: Rp 8.000 = 2000 * (2^2)
Hari 4: Rp 16.000 = 2000 * (2^3)
...
Hari N: Rp 2000 * (2^(N-1))
```

#### Implementasi:
```javascript
function calculateLateDays(dueDate, returnDate = null) {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const returnD = returnDate ? new Date(returnDate) : new Date();
  returnD.setHours(0, 0, 0, 0);
  
  const diffTime = returnD - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

function calculateFine(lateDays) {
  if (lateDays <= 0) return 0;
  const baseFine = 2000;
  const fine = baseFine * Math.pow(2, lateDays - 1);
  return Math.round(fine);
}
```

#### Kapan Dihitung:
- Saat staff confirm return (`/api/borrowings/[id]/confirm-return`)
- Jika `return_date > due_date`, calculate fine
- Store `fine_amount` dan `fine_days` di database

---

### 2. **Algoritma Status Peminjaman (Borrowing Status Flow)**

#### State Machine:
```
pending → approved → borrowed → return_requested → returned
   ↓
rejected
```

#### Transisi:
1. **pending** (User request)
   - User klik "Pinjam Buku"
   - Status: `'pending'`
   - Stok: Tidak berkurang

2. **approved** (Staff approve)
   - Staff klik "Setujui"
   - Status: `'approved'`
   - Stok: Masih tidak berkurang (tunggu pickup)

3. **borrowed** (Staff confirm pickup)
   - Staff klik "Konfirmasi Pengambilan"
   - Status: `'borrowed'`
   - Stok: `books.available -= 1`
   - `borrow_date` = hari ini
   - `due_date` = hari ini + 7 hari (default)

4. **return_requested** (User request return)
   - User klik "Kembalikan Buku"
   - Status: `'return_requested'`
   - Stok: Masih berkurang (tunggu staff confirm)

5. **returned** (Staff confirm return)
   - Staff klik "Konfirmasi Pengembalian"
   - Status: `'returned'`
   - Stok: `books.available += 1`
   - `return_date` = hari ini
   - Calculate fine jika terlambat

6. **rejected** (Staff reject)
   - Staff klik "Tolak"
   - Status: `'rejected'`
   - Stok: Tidak berkurang

#### Implementasi:
- **User Request**: `POST /api/borrowings`
- **Staff Approve**: `PATCH /api/borrowings/[id]` dengan `status: 'approved'`
- **Staff Confirm Pickup**: `PATCH /api/borrowings/[id]/pickup`
- **User Request Return**: `PATCH /api/borrowings/[id]/return-request`
- **Staff Confirm Return**: `PATCH /api/borrowings/[id]/confirm-return`

---

### 3. **Algoritma Pembayaran Denda (Fine Payment Flow)**

#### Flow:
```
1. User terlambat → fine_amount & fine_days calculated
2. User klik "Bayar Denda"
3. Create Xendit invoice → xendit_invoice_id stored
4. Status: xendit_payment_status = 'pending_verification'
5. User bayar via Xendit
6. Xendit callback → status = 'pending_verification'
7. Staff verify → fine_paid = TRUE, status = 'paid'
```

#### Implementasi:

**1. Create Payment** (`POST /api/payments/create`)
```javascript
// Calculate fine if not exists
const fineCalculation = calculateBorrowingFine(dueDate, returnDate);
fineAmount = fineCalculation.fineAmount;
fineDays = fineCalculation.lateDays;

// Create Xendit invoice
const invoice = await createInvoice({
  externalId: `FINE-${borrowingId}-${timestamp}`,
  amount: fineAmount,
  customerName: user.name,
  customerEmail: user.email,
  description: `Denda Keterlambatan: ${book.title} (${fineDays} hari)`,
  successRedirectUrl: `${baseUrl}/payment/success?external_id=${externalId}`
});

// Update database
UPDATE borrowings 
SET xendit_invoice_id = ?,
    xendit_payment_status = 'pending_verification',
    fine_paid_at = NOW()
WHERE id = ?
```

**2. Xendit Callback** (`POST /api/payments/callback`)
```javascript
// Xendit sends webhook when payment status changes
if (status === 'PAID') {
  UPDATE borrowings 
  SET xendit_payment_status = 'pending_verification',
      fine_paid = FALSE,  // Not yet paid until staff verifies
      fine_paid_at = NOW()
  WHERE id = ?
}
```

**3. Staff Verify** (`POST /api/payments/verify/[borrowingId]`)
```javascript
// Staff approves payment
if (action === 'approve') {
  UPDATE borrowings 
  SET xendit_payment_status = 'paid',
      fine_paid = TRUE,
      fine_verified_by = ?,
      fine_verified_at = NOW(),
      fine_verification_note = ?
  WHERE id = ?
}
```

**4. Status Check** (`GET /api/payments/status/[orderId]`)
```javascript
// Auto-update to pending_verification if invoice exists
if (xendit_invoice_id && status === 'pending') {
  UPDATE borrowings 
  SET xendit_payment_status = 'pending_verification'
  WHERE id = ?
}
```

---

### 4. **Algoritma Stock Management**

#### Rules:
- **Stock** = Total buku yang dimiliki
- **Available** = Buku yang tersedia untuk dipinjam

#### Update Stock:
```javascript
// Saat buku dipinjam (status: 'borrowed')
UPDATE books SET available = available - 1 WHERE id = ?

// Saat buku dikembalikan (status: 'returned')
UPDATE books SET available = available + 1 WHERE id = ?

// Saat create/edit buku
// stock = total, available = stock (jika baru)
```

#### Validation:
- User tidak bisa pinjam jika `available = 0`
- Check di `POST /api/borrowings`:
```javascript
if (book.available <= 0) {
  return error('Buku tidak tersedia');
}
```

---

### 5. **Algoritma Authentication & Authorization**

#### Authentication Flow:
1. User login dengan email & password
2. NextAuth validate credentials
3. Check di table sesuai role (users/staff/admin)
4. Compare password dengan bcrypt
5. Generate JWT token
6. Store session

#### Authorization (Middleware):
```javascript
// middleware.js
- Public routes: /login, /register, /books/*
- Protected routes: /siswa/*, /petugas/*, /admin/*
- Role-based access:
  - /admin/* → hanya admin
  - /petugas/* → staff atau admin
  - /siswa/* → siswa atau umum
```

#### Session Management:
- JWT strategy (NextAuth)
- Session maxAge: 30 days
- Auto-clear on browser close (via SessionManager)

---

## 📦 Library & Dependencies

### Core Dependencies

#### 1. **Next.js 16.0.3**
- **Purpose**: React framework dengan SSR/SSG
- **Usage**: 
  - App Router untuk routing
  - API Routes untuk backend
  - Server Components & Client Components

#### 2. **React 19.2.0**
- **Purpose**: UI library
- **Usage**: Components, hooks (useState, useEffect, etc.)

#### 3. **NextAuth.js 5.0.0-beta.30**
- **Purpose**: Authentication & session management
- **Usage**: 
  - JWT-based authentication
  - Session management
  - Role-based access control
- **Credentials**: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

#### 4. **mysql2 3.15.3**
- **Purpose**: MySQL database driver
- **Usage**: 
  - Database connection pooling
  - SQL queries (execute, query)
- **Credentials**: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

#### 5. **bcryptjs 3.0.3**
- **Purpose**: Password hashing
- **Usage**: 
  - Hash password saat registrasi
  - Compare password saat login
- **Algorithm**: bcrypt (cost factor 10)

#### 6. **Xendit** (via fetch API)
- **Purpose**: Payment gateway
- **Usage**: 
  - Create invoice
  - Check payment status
  - Handle webhooks
- **Credentials**: `XENDIT_SECRET_KEY`, `XENDIT_IS_PRODUCTION`

#### 7. **Tailwind CSS 4.1.17**
- **Purpose**: Utility-first CSS framework
- **Usage**: Styling semua components

#### 8. **Framer Motion 12.23.24**
- **Purpose**: Animation library
- **Usage**: Page transitions, component animations

#### 9. **GSAP 3.13.0**
- **Purpose**: Advanced animation library
- **Usage**: Complex animations (Galaxy background, etc.)

#### 10. **Lucide React 0.554.0**
- **Purpose**: Icon library
- **Usage**: Icons di seluruh aplikasi

### Dev Dependencies
- **ESLint**: Code linting
- **PostCSS & Autoprefixer**: CSS processing
- **Tailwind CSS PostCSS**: Tailwind integration

---

## 🔐 Credentials & Konfigurasi

### Environment Variables (`.env.local`)

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=perpustakaan

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters-long

# Xendit Payment Gateway
XENDIT_SECRET_KEY=xnd_development_xxxxxxxxxxxxx
XENDIT_IS_PRODUCTION=false
XENDIT_CALLBACK_TOKEN=your-callback-token (optional)

# Base URL (for payment redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Cara Generate Credentials

#### 1. **NEXTAUTH_SECRET**
```bash
# Generate random secret (32+ characters)
openssl rand -base64 32
```

#### 2. **XENDIT_SECRET_KEY**
1. Daftar di https://dashboard.xendit.co/register
2. Buat akun (sandbox untuk testing)
3. Settings → API Keys → Create API Key
4. Copy Secret Key ke `.env.local`

#### 3. **Database Password**
- Default MySQL: `root` dengan password kosong (development)
- Production: Gunakan strong password

### Default Accounts

#### Admin (Default)
- Email: `admin@perpustakaan.com`
- Password: `admin123`
- Hash: `$2b$10$4LaxbA5yrA.Q9qBVcTxyDOKilx2O8N6zW5zfDZ1shzftUKWWJC6t2`

**⚠️ PENTING**: Ganti password default di production!

---

## 🔄 Flow Diagram & Alur Kerja

### 1. **User Registration Flow**
```
User → Fill Form → POST /api/auth/register
  → Hash Password (bcrypt) → Insert to users table
  → Redirect to /login
```

### 2. **User Login Flow**
```
User → Enter Credentials → POST /api/auth/[...nextauth]
  → Query users table → Compare password (bcrypt)
  → Generate JWT → Store session
  → Redirect to /siswa/home
```

### 3. **Borrowing Request Flow**
```
User → Click "Pinjam" → POST /api/borrowings
  → Check available stock → Create borrowing (status: 'pending')
  → Staff notification → Staff approve
  → Status: 'approved' → Staff confirm pickup
  → Status: 'borrowed' → Decrease available stock
```

### 4. **Return Request Flow**
```
User → Click "Kembalikan" → PATCH /api/borrowings/[id]/return-request
  → Status: 'return_requested' → Staff notification
  → Staff confirm return → PATCH /api/borrowings/[id]/confirm-return
  → Calculate fine (if overdue) → Status: 'returned'
  → Increase available stock
```

### 5. **Fine Payment Flow**
```
User terlambat → Staff confirm return → Calculate fine
  → User click "Bayar Denda" → POST /api/payments/create
  → Create Xendit invoice → Redirect to Xendit payment page
  → User pay → Xendit callback → Status: 'pending_verification'
  → Staff verify → POST /api/payments/verify/[borrowingId]
  → Status: 'paid', fine_paid = TRUE
```

### 6. **Notification Flow**
```
Event (new request, return request, etc.) → Store in database
  → Polling: GET /api/notifications (every 3 seconds)
  → Display notification → User dismiss → Store in localStorage
  → Filter dismissed notifications
```

---

## 📊 Database Indexes & Performance

### Indexes:
- `users.email` (UNIQUE)
- `staff.email` (UNIQUE)
- `admin.email` (UNIQUE)
- `books.genre`, `books.title`, `books.author`
- `borrowings.user_id`, `borrowings.book_id`, `borrowings.status`
- `favorites.user_id`, `favorites.book_id` (UNIQUE)
- `reviews.book_id`, `reviews.user_id`, `reviews.rating`

### Query Optimization:
- Use indexes untuk search & filter
- JOIN queries untuk related data
- LIMIT untuk pagination
- Connection pooling (mysql2)

---

## 🔒 Security Measures

1. **Password Hashing**: bcryptjs (cost factor 10)
2. **JWT Authentication**: NextAuth.js
3. **SQL Injection Prevention**: Parameterized queries (mysql2)
4. **XSS Prevention**: React auto-escaping
5. **CSRF Protection**: NextAuth.js built-in
6. **Role-based Access Control**: Middleware checks
7. **Environment Variables**: Sensitive data in `.env.local`

---

## 🚀 Deployment Checklist

1. ✅ Set production environment variables
2. ✅ Change default admin password
3. ✅ Set `NEXTAUTH_URL` to production domain
4. ✅ Set `XENDIT_IS_PRODUCTION=true`
5. ✅ Use production database
6. ✅ Enable HTTPS
7. ✅ Set secure cookies (`useSecureCookies: true`)
8. ✅ Run database migrations
9. ✅ Test all flows
10. ✅ Monitor logs & errors

---

## 📝 Notes

- **Fine System**: Exponential fine (2^n) untuk mendorong pengembalian tepat waktu
- **Manual Verification**: Staff harus verify payment untuk mencegah fraud
- **Stock Management**: Available stock update otomatis saat borrow/return
- **Notifications**: Real-time via polling (3s interval)
- **Session**: Auto-clear on browser close untuk security

---

**Dokumentasi ini dibuat untuk membantu memahami sistem secara menyeluruh.**
**Untuk pertanyaan atau update, silakan edit file ini.**

