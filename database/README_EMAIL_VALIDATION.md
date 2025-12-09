# Email Validation & Fix Tools

Tools untuk mengecek dan memperbaiki email yang tidak valid di database.

## 📋 Script: validate-and-fix-emails.js

Script untuk mengecek dan otomatis memperbaiki email yang tidak valid di semua tabel (users, staff, admin).

### Cara Menggunakan

```bash
# Menggunakan npm script
npm run validate-emails

# Atau langsung dengan node
node database/validate-and-fix-emails.js
```

### Apa yang Dilakukan Script?

1. ✅ Mengecek semua email di tabel `users`, `staff`, dan `admin`
2. ✅ Mencoba memperbaiki email yang bisa diperbaiki:
   - Trim whitespace
   - Convert ke lowercase
   - Remove multiple spaces
   - Remove spaces around @
3. ✅ Melaporkan email yang tidak valid dan tidak bisa diperbaiki (perlu manual fix)

### Output

Script akan menampilkan:
- ✅ Jumlah email yang berhasil diperbaiki
- ❌ Jumlah email yang tidak valid (perlu manual fix)
- ⚠️ Jumlah email yang kosong
- Detail lengkap untuk setiap email yang tidak valid

## 🔧 API Endpoint: /api/admin/fix-invalid-emails

Endpoint untuk admin untuk melihat dan memperbaiki email yang tidak valid.

### GET - List Invalid Emails

```bash
GET /api/admin/fix-invalid-emails
```

**Response:**
```json
{
  "invalidEmails": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "invalid@email",
      "table": "users",
      "errors": [...]
    }
  ],
  "count": 1
}
```

### POST - Fix Invalid Email

```bash
POST /api/admin/fix-invalid-emails
Content-Type: application/json

{
  "userId": 1,
  "newEmail": "valid@email.com",
  "table": "users"
}
```

**Request Body:**
- `userId` (number, required): ID user/staff/admin
- `newEmail` (string, required): Email baru yang valid
- `table` (string, optional): Tabel yang akan diupdate ('users', 'staff', atau 'admin'). Default: 'users'

**Response:**
```json
{
  "message": "Email berhasil diperbarui",
  "userId": 1,
  "newEmail": "valid@email.com",
  "table": "users"
}
```

## 📝 Helper Functions

File `lib/validations/emailHelper.js` menyediakan helper functions:

- `strictEmailSchema`: Schema Zod untuk validasi email yang strict (untuk registrasi baru)
- `flexibleEmailSchema`: Schema Zod untuk validasi email yang lebih fleksibel (untuk existing data)
- `normalizeEmail(email)`: Normalize email (trim, lowercase, remove spaces)
- `tryFixEmail(email)`: Coba perbaiki email yang tidak valid
- `isValidEmail(email)`: Check apakah email valid

## ⚠️ Catatan Penting

1. **Backup Database**: Selalu backup database sebelum menjalankan script fix
2. **Test di Development**: Test script di development environment dulu
3. **Manual Review**: Review email yang tidak valid sebelum memperbaikinya
4. **Email Unik**: Pastikan email baru tidak duplikat di tabel lain

## 🔍 Contoh Email yang Bisa Diperbaiki

- `"  USER@EXAMPLE.COM  "` → `"user@example.com"`
- `"user @ example.com"` → `"user@example.com"`
- `"User@Example.Com"` → `"user@example.com"`

## ❌ Email yang Tidak Bisa Diperbaiki Otomatis

- `"invalid@email"` (tidak ada TLD)
- `"@example.com"` (tidak ada username)
- `"user@"` (tidak ada domain)
- Email yang terlalu panjang (>255 karakter)

Email seperti ini perlu diperbaiki manual melalui API endpoint atau langsung di database.

