# 💰 Sistem Denda Keterlambatan dengan Xendit

## 📋 Ringkasan Fitur

Sistem denda otomatis untuk pengembalian buku yang terlambat dengan integrasi pembayaran Xendit.

### Perhitungan Denda:
- **Hari 1**: Rp 2.000
- **Hari 2**: Rp 4.000  
- **Hari 3**: Rp 8.000
- **Hari 4**: Rp 16.000
- **Hari 5**: Rp 32.000
- Dan seterusnya (dikali 2 setiap hari)

**Formula**: `2000 * (2 ^ (hari - 1))`

## 🚀 Setup Awal

### 1. Jalankan Migration Database

```bash
# Masuk ke MySQL
mysql -u root -p

# Jalankan migration
source database/add_fine_system.sql;
```

Atau jalankan SQL secara manual:
```sql
USE perpustakaan;

ALTER TABLE borrowings 
ADD COLUMN fine_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER notes,
ADD COLUMN fine_days INT DEFAULT 0 AFTER fine_amount,
ADD COLUMN fine_paid BOOLEAN DEFAULT FALSE AFTER fine_days,
ADD COLUMN fine_paid_at TIMESTAMP NULL AFTER fine_paid,
ADD COLUMN xendit_invoice_id VARCHAR(255) NULL AFTER fine_paid_at,
ADD COLUMN xendit_payment_status ENUM('pending', 'paid', 'failed', 'expired') DEFAULT NULL AFTER xendit_invoice_id;

CREATE INDEX idx_xendit_invoice_id ON borrowings(xendit_invoice_id);
CREATE INDEX idx_fine_paid ON borrowings(fine_paid);
```

### 2. Setup Xendit

Ikuti tutorial lengkap di file **`XENDIT_SETUP.md`**

**Quick Setup:**
1. Daftar di https://dashboard.xendit.co/register
2. Dapatkan Secret Key dari Settings → API Keys
3. Tambahkan ke `.env.local`:

```env
XENDIT_SECRET_KEY=xnd_development_xxxxxxxxxxxxx
XENDIT_IS_PRODUCTION=false
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

**Catatan**: Xendit menggunakan REST API langsung, tidak perlu install package khusus!

## 📁 File yang Dibuat

### Database
- `database/add_fine_system.sql` - Migration untuk field denda

### Library
- `lib/fineCalculator.js` - Fungsi perhitungan denda
- `lib/xendit.js` - Integrasi Xendit

### API Routes
- `app/api/payments/create/route.js` - Membuat payment
- `app/api/payments/callback/route.js` - Webhook dari Xendit
- `app/api/payments/status/[orderId]/route.js` - Cek status payment

### Components
- `components/borrowings/FinePaymentModal.jsx` - Modal pembayaran denda

### Pages
- `app/payment/success/page.jsx` - Halaman sukses pembayaran
- `app/payment/unfinish/page.jsx` - Halaman pembayaran belum selesai
- `app/payment/error/page.jsx` - Halaman error pembayaran

### Documentation
- `XENDIT_SETUP.md` - Tutorial lengkap setup Xendit
- `README_FINE_SYSTEM.md` - Dokumentasi ini

## 🔄 Alur Kerja

1. **User mengembalikan buku terlambat**
   - Staff konfirmasi pengembalian di dashboard
   - Sistem otomatis menghitung denda berdasarkan hari keterlambatan

2. **Denda muncul di halaman peminjaman user**
   - User melihat jumlah denda yang harus dibayar
   - Tombol "Bayar Denda" muncul jika belum dibayar

3. **User klik "Bayar Denda"**
   - Modal pembayaran muncul
   - User klik "Bayar Sekarang"
   - Sistem membuat invoice di Xendit
   - User diarahkan ke halaman pembayaran Xendit

4. **User melakukan pembayaran**
   - Pilih metode pembayaran (Kartu Kredit, Virtual Account, E-Wallet, dll)
   - Selesaikan pembayaran

5. **Callback dari Xendit**
   - Xendit mengirim webhook ke `/api/payments/callback`
   - Sistem update status pembayaran di database
   - User diarahkan ke halaman sukses/error

6. **Status terupdate**
   - Denda ditandai sebagai sudah dibayar
   - Badge "Denda sudah dibayar" muncul

## 🧪 Testing

### Test Kartu Kredit (Sandbox)

**Visa:**
- Card: `4000 0000 0000 0002`
- CVV: `123`
- Expiry: `12/25` (atau bulan/tahun apapun di masa depan)
- OTP: `112233`

**Mastercard:**
- Card: `5200 0000 0000 0007`
- CVV: `123`
- Expiry: `12/25`

### Test Scenario

1. Buat peminjaman buku
2. Set due_date ke tanggal kemarin (untuk simulasi terlambat)
3. Staff konfirmasi pengembalian
4. Cek halaman peminjaman user - denda harus muncul
5. Klik "Bayar Denda"
6. Gunakan kartu test di atas
7. Verifikasi status pembayaran

## 📊 Contoh Perhitungan

| Hari Keterlambatan | Denda per Hari | Total Denda |
|-------------------|----------------|-------------|
| 1 | Rp 2.000 | Rp 2.000 |
| 2 | Rp 4.000 | Rp 6.000 |
| 3 | Rp 8.000 | Rp 14.000 |
| 4 | Rp 16.000 | Rp 30.000 |
| 5 | Rp 32.000 | Rp 62.000 |
| 6 | Rp 64.000 | Rp 126.000 |
| 7 | Rp 128.000 | Rp 254.000 |

**Catatan**: Total denda adalah akumulasi dari semua hari.

## 🔧 Troubleshooting

### Denda tidak muncul
- Pastikan migration sudah dijalankan
- Cek apakah `fine_amount` dan `fine_days` sudah terisi di database
- Pastikan `return_date` sudah diisi saat staff konfirmasi pengembalian

### Payment tidak terupdate
- Cek webhook URL di dashboard Xendit
- Pastikan callback URL bisa diakses (gunakan ngrok untuk local)
- Cek log di dashboard Xendit

### Error "Invalid API key"
- Pastikan Secret Key benar (tidak ada spasi)
- Pastikan menggunakan key yang sesuai (Sandbox vs Production)
- Restart server setelah update `.env.local`

## 📝 Catatan Penting

1. **Production Setup**: Ganti `XENDIT_IS_PRODUCTION=true` dan gunakan Production Key
2. **Webhook URL**: Set di dashboard Xendit ke `https://yourdomain.com/api/payments/callback`
3. **Security**: Jangan commit `.env.local` ke git
4. **Testing**: Selalu test di Sandbox sebelum production

## 🎉 Selesai!

Sistem denda sudah siap digunakan! Jika ada pertanyaan, lihat dokumentasi di `XENDIT_SETUP.md` atau hubungi support Xendit.

