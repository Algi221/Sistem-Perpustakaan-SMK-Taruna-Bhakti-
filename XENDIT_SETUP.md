# 🚀 Tutorial Setup Xendit dari Awal (Lebih Mudah!)

Xendit adalah payment gateway Indonesia yang **lebih mudah** setup-nya dibanding Midtrans!

## Langkah 1: Daftar Akun Xendit

1. Buka https://dashboard.xendit.co/register
2. Klik **"Daftar"** atau **"Sign Up"**
3. Isi form pendaftaran:
   - **Email**: Email bisnis Anda
   - **Password**: Min 8 karakter
   - **Nama**: Nama lengkap
   - **Nomor Telepon**: Format +62xxxxxxxxxx
   - **Nama Bisnis**: Contoh "Perpustakaan SMK Taruna Bhakti"
4. **Verifikasi email** yang dikirim Xendit
5. **Verifikasi nomor telepon** via SMS/WhatsApp

**Catatan**: Xendit biasanya lebih mudah dan cepat proses verifikasinya!

## Langkah 2: Login ke Dashboard

1. Login ke https://dashboard.xendit.co/
2. Pilih **"Sandbox"** untuk testing (gratis, tidak ada biaya)
3. Atau **"Production"** untuk live (perlu verifikasi dokumen)

## Langkah 3: Dapatkan API Key

1. Di dashboard, klik menu **"Settings"** → **"API Keys"**
2. Klik **"Buat API key"** atau **"Create API Key"**

### 3.1 Isi Nama API Key
- **Nama API key**: Contoh "Perpustakaan Payment Key" atau "Fine Payment Key"
- Maksimal 15 karakter
- Ini hanya untuk identifikasi, bisa diisi bebas

### 3.2 Set Permission (Izin)

Untuk sistem pembayaran denda, kita hanya perlu permission berikut:

#### ✅ **Produk menerima pembayaran** → **Invoices**
- Pilih **"Write"** (penting untuk membuat invoice)
- Atau minimal **"Read"** jika hanya cek status

#### ✅ **Balance** (Opsional)
- Pilih **"Read"** (untuk cek saldo, opsional)

#### ✅ **Transaction** (Opsional)
- Pilih **"Read"** (untuk melihat transaksi, opsional)

**Catatan:**
- Untuk **Credit card, Virtual accounts, E-wallets, dll**: Bisa set **"None"** (tidak perlu karena kita pakai Invoices)
- Untuk **Produk mengirim pembayaran**: Set semua ke **"None"** (tidak perlu)
- Untuk **Report, xenPlatform, xenShield, Pembuktian Identitas**: Set semua ke **"None"** (tidak perlu)

**Minimal yang diperlukan:**
- ✅ **Invoices**: **Write** (WAJIB!)
- ✅ **Balance**: **Read** (opsional)
- ✅ **Transaction**: **Read** (opsional)

### 3.3 Buat Key
1. Setelah set permission, klik tombol **"Buat key"** atau **"Create key"**
2. **⚠️ PENTING**: Secret Key hanya muncul **sekali**!
3. **Copy Secret Key** dengan format: `xnd_development_xxxxxxxxxxxxx`
4. **Simpan dengan aman!** Jangan share ke siapapun!

**Tips:**
- Copy ke notepad/text editor dulu sebelum tutup halaman
- Simpan di password manager (1Password, LastPass, dll)
- Jangan commit ke git!

## Langkah 4: Setup di Project

### 4.1 Install Package (Tidak Perlu!)

Xendit menggunakan **REST API langsung**, tidak perlu install package khusus! Kita pakai `fetch` native JavaScript.

### 4.2 Tambahkan ke .env.local

Buat atau edit file `.env.local` di root project:

```env
# Xendit Configuration
XENDIT_SECRET_KEY=xnd_development_xxxxxxxxxxxxx
XENDIT_IS_PRODUCTION=false

# Base URL (untuk callback)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: Callback Token untuk webhook security
XENDIT_CALLBACK_TOKEN=your_random_token_here
```

**Catatan:**
- Untuk **Sandbox/Testing**: Gunakan key yang dimulai dengan `xnd_development_`
- Untuk **Production**: Gunakan key yang dimulai dengan `xnd_production_`
- `XENDIT_IS_PRODUCTION=false` untuk sandbox, `true` untuk production

### 4.3 Test Payment

1. Jalankan project: `npm run dev`
2. Coba buat peminjaman dan kembalikan terlambat
3. Klik tombol "Bayar Denda"
4. Anda akan diarahkan ke halaman Xendit

## Langkah 5: Testing dengan Kartu Kredit

Xendit menyediakan kartu kredit test:

### Kartu Kredit Test (Sandbox)

**Visa:**
- Card Number: `4000 0000 0000 0002`
- CVV: `123`
- Expiry: Bulan/tahun apapun di masa depan (contoh: `12/25`)
- OTP: `112233`

**Mastercard:**
- Card Number: `5200 0000 0000 0007`
- CVV: `123`
- Expiry: Bulan/tahun apapun di masa depan

**3D Secure:**
- OTP: `112233`

### Virtual Account Test

Xendit otomatis generate Virtual Account untuk testing. Tidak perlu setup khusus!

## Langkah 6: Setup Webhook (Opsional)

1. Di dashboard Xendit, masuk ke **"Settings"** → **"Webhooks"**
2. Klik **"Add Webhook"**
3. Set **Webhook URL** ke:
   ```
   https://yourdomain.com/api/payments/callback
   ```
4. Pilih events: `invoice.paid`, `invoice.expired`, `invoice.failed`
5. Untuk local testing, gunakan ngrok:
   ```bash
   ngrok http 3000
   ```
   Lalu set URL ngrok di dashboard

## Langkah 7: Setup Production (Opsional)

Jika sudah siap untuk production:

1. Verifikasi akun di dashboard Xendit
2. Upload dokumen yang diperlukan (KTP, NPWP, dll)
3. Ganti key di `.env.local` dengan Production Key
4. Set `XENDIT_IS_PRODUCTION=true`
5. Update `NEXT_PUBLIC_BASE_URL` dengan domain production

## Keuntungan Xendit vs Midtrans

✅ **Lebih mudah registrasi** - Tidak ada masalah captcha  
✅ **Lebih cepat verifikasi** - Proses lebih cepat  
✅ **Lebih banyak metode pembayaran** - OVO, DANA, LinkAja, dll  
✅ **Tidak perlu install package** - Pakai REST API langsung  
✅ **Dokumentasi lebih jelas** - Lebih mudah dipahami  
✅ **Support Indonesia lebih baik** - Tim support lokal  

## Troubleshooting

### Error: "Invalid API key"
- Pastikan Secret Key benar
- Pastikan tidak ada spasi di awal/akhir key
- Pastikan menggunakan key yang sesuai (Sandbox vs Production)

### Error: "Invoice not found"
- Pastikan External ID unik
- Pastikan callback URL sudah benar

### Payment tidak terupdate
- Cek webhook URL di dashboard Xendit
- Cek log di dashboard Xendit
- Pastikan API callback berjalan dengan benar

## Dokumentasi Lengkap

- Dokumentasi: https://docs.xendit.co/
- API Reference: https://developers.xendit.co/api-reference/
- Support: support@xendit.co atau chat di dashboard

## Biaya Xendit

- **Setup Fee**: Gratis
- **Transaction Fee**: 
  - Credit Card: 2.9% + Rp 2.000
  - Virtual Account: Rp 2.500 - 4.500 (tergantung bank)
  - E-Wallet: 0.5% - 1%
  - QRIS: 0.7%
- **Settlement**: 1-2 hari kerja

---

**Selamat!** Sistem pembayaran denda dengan Xendit sudah siap digunakan! 🎉

