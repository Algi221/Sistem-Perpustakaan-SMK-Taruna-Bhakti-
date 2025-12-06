# 🔐 Setup Sistem Reset Password

## Overview

Sistem reset password dengan verifikasi email dan persetujuan admin. Flow:
1. User request reset password → kirim email verifikasi
2. User klik link verifikasi → email terverifikasi
3. Admin approve request → kirim email dengan reset token
4. User reset password dengan token

## 📋 Setup Database

Jalankan migration SQL:

```bash
mysql -u root -p perpustakaan < database/create_password_reset_requests.sql
```

Atau jalankan SQL langsung:

```sql
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
```

## 📧 Setup Email (SMTP)

Tambahkan ke `.env.local`:

```env
# SMTP Configuration (untuk kirim email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@perpustakaan.com

# Base URL (untuk link di email)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Setup Gmail SMTP

1. **Buat App Password**:
   - Buka https://myaccount.google.com/apppasswords
   - Pilih "Mail" dan "Other (Custom name)"
   - Masukkan nama: "Perpustakaan App"
   - Copy 16-digit password yang di-generate

2. **Update .env.local**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App password (16 digit, tanpa spasi)
   SMTP_FROM=noreply@perpustakaan.com
   ```

### Setup SMTP Lainnya

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### Custom SMTP:
```env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com
```

## 🔄 Flow Sistem

### 1. User Request Reset Password
- User klik "Lupa Password?" di halaman login
- Masukkan email
- Sistem kirim email verifikasi ke email terdaftar

### 2. Verifikasi Email
- User klik link di email
- Email terverifikasi → status: `email_verified = TRUE`
- Request muncul di admin panel

### 3. Admin Approve
- Admin buka menu "Reset Password"
- Lihat request yang sudah terverifikasi
- Approve → sistem generate reset token & kirim email ke user
- Reject → request ditolak

### 4. User Reset Password
- User klik link di email (setelah di-approve)
- Masukkan password baru
- Password berhasil direset → bisa login dengan password baru

## 📁 File yang Dibuat

### Database
- `database/create_password_reset_requests.sql` - Migration table

### API Routes
- `app/api/auth/request-reset-password/route.js` - Request reset password
- `app/api/auth/verify-email-token/route.js` - Verify email token
- `app/api/auth/reset-password/route.js` - Reset password dengan token
- `app/api/admin/password-reset-requests/route.js` - Get requests (admin)
- `app/api/admin/password-reset-requests/[id]/route.js` - Approve/reject (admin)

### Pages
- `app/reset-password/verify/page.jsx` - Halaman verifikasi email
- `app/reset-password/page.jsx` - Halaman reset password
- `app/admin/dashboard/reset-password/page.js` - Halaman admin

### Components
- `app/login/components/ForgotPasswordModal.jsx` - Modal request reset password
- `components/admin/ResetPasswordRequestsClient.jsx` - Client component admin

### Libraries
- `lib/email.js` - Email helper (send verification & reset email)

## 🎯 Fitur

✅ Request reset password dengan verifikasi email
✅ Admin approve/reject reset requests
✅ Email notification untuk setiap step
✅ Token expiration (24 jam)
✅ Support untuk user, staff, dan admin
✅ UI yang user-friendly dengan modal dan toast notifications

## 🧪 Testing

1. **Test Request Reset Password**:
   - Buka `/login`
   - Klik "Lupa Password?"
   - Masukkan email yang terdaftar
   - Cek email inbox

2. **Test Verifikasi Email**:
   - Klik link di email
   - Harus redirect ke halaman verifikasi
   - Status berubah jadi "Email Terverifikasi"

3. **Test Admin Approve**:
   - Login sebagai admin
   - Buka menu "Reset Password"
   - Approve request yang sudah terverifikasi
   - Cek email user (harus dapat email dengan reset token)

4. **Test Reset Password**:
   - Klik link di email (setelah di-approve)
   - Masukkan password baru
   - Login dengan password baru

## ⚠️ Catatan Penting

1. **Email SMTP harus dikonfigurasi** - Tanpa SMTP, email tidak akan terkirim
2. **Token expiration** - Semua token berlaku 24 jam
3. **Security** - Sistem tidak mengungkapkan apakah email terdaftar atau tidak (untuk security)
4. **Admin approval** - Semua reset password harus disetujui admin terlebih dahulu

## 🔧 Troubleshooting

### Email tidak terkirim
- Cek SMTP credentials di `.env.local`
- Pastikan App Password sudah benar (untuk Gmail)
- Cek console logs untuk error
- Test dengan SMTP tester online

### Token tidak valid
- Token mungkin sudah expired (24 jam)
- Token sudah digunakan
- Request sudah di-reject atau completed

### Admin tidak bisa approve
- Pastikan email sudah terverifikasi (`email_verified = TRUE`)
- Cek status request di database
- Pastikan admin sudah login

---

**Sistem siap digunakan setelah setup SMTP!** 🚀







