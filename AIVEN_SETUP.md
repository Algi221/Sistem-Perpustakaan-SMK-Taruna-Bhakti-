# 🚀 Panduan Setup Aiven MySQL untuk Project Perpustakaan

## ✅ Status Setup

Database Aiven sudah dibuat dan koneksi sudah dikonfigurasi!

### Connection Details:
- **Host**: `mysql-aae530-algifahrihero-44b2.c.aivencloud.com`
- **Port**: `24101`
- **User**: `avnadmin`
- **Database**: `defaultdb`
- **SSL**: Required

---

## 📝 Langkah Setup

### 1. ✅ Update Code (Sudah Selesai)

File `lib/db.js` sudah di-update untuk support SSL connection dari Aiven.

### 2. Setup Environment Variables

#### A. Untuk Local Development

Buat file `.env.local` di root project:

```env
DB_HOST=mysql-aae530-algifahrihero-44b2.c.aivencloud.com
DB_PORT=24101
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password-here
DB_NAME=defaultdb

NEXTAUTH_SECRET=your-secret-key-minimum-32-characters-long
NEXTAUTH_URL=http://localhost:3000
```

**Catatan**: File `.env.local` sudah di `.gitignore`, jadi aman dari commit.

#### B. Untuk Vercel Production

1. Buka Vercel Dashboard → Project → Settings → Environment Variables
2. Tambahkan variables berikut:

```
DB_HOST=mysql-aae530-algifahrihero-44b2.c.aivencloud.com
DB_PORT=24101
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password-here
DB_NAME=defaultdb

NEXTAUTH_SECRET=[generate-with: openssl rand -base64 32]
NEXTAUTH_URL=https://your-app.vercel.app
```

**⚠️ Penting**: Setelah deploy pertama, update `NEXTAUTH_URL` dengan URL production kamu!

### 3. Import Database Schema

#### Metode 1: Via Aiven Web Terminal (Recommended)

1. Buka Aiven Console → Service → Overview
2. Klik **"Quick connect"** atau **"Tools"** → **"Connect"**
3. Pilih **"Web terminal"** atau download MySQL client
4. Login ke database:
   ```bash
   mysql -h mysql-aae530-algifahrihero-44b2.c.aivencloud.com \
         -P 24101 \
         -u avnadmin \
         -p \
         --ssl-mode=REQUIRED \
         defaultdb
   ```
   (Password: `your-aiven-password-here` - dapatkan dari Aiven Console)

5. Import schema:
   ```sql
   USE defaultdb;
   SOURCE database/schema.sql;
   ```
   
   Atau copy-paste isi file `database/schema.sql` langsung ke terminal.

#### Metode 2: Via Local MySQL Client

Jika kamu punya MySQL client lokal:

```bash
mysql -h mysql-aae530-algifahrihero-44b2.c.aivencloud.com \
      -P 24101 \
      -u avnadmin \
      -p \
      --ssl-mode=REQUIRED \
      defaultdb < database/schema.sql
```

#### Metode 3: Via Node.js Script (Temporary)

Buat script temporary untuk import schema jika metode di atas tidak work.

### 4. Test Connection

Jalankan development server:

```bash
npm run dev
```

Test dengan:
- Login/Register di aplikasi
- Cek apakah data tersimpan ke database
- Test CRUD operations

---

## 🔒 Security Notes

1. **Password**: Jangan commit password ke git! File `.env.local` sudah di `.gitignore`.

2. **SSL**: Koneksi ke Aiven sudah menggunakan SSL (secure).

3. **Vercel**: Pastikan environment variables di Vercel sudah di-set dengan benar.

---

## 📊 Free Tier Limitations

- ✅ **1 GB Storage** - Cukup untuk development/testing
- ✅ **1 CPU, 1 GB RAM** - Performa cukup untuk traffic kecil
- ⚠️ **Auto Power-off** - Service akan mati saat idle, auto-start saat ada request (cold start ~30-60 detik)
- ⚠️ **No Backup** - Tidak ada automatic backup di free tier

---

## 🚨 Troubleshooting

### Error: "SSL connection required"
- ✅ **Fixed**: Code sudah di-update untuk enable SSL otomatis untuk Aiven

### Error: "Connection refused"
- Cek host & port sudah benar
- Pastikan public access enabled di Aiven
- Cek IP whitelist (jika ada)

### Error: "Access denied"
- Cek username: `avnadmin` (bukan `root`)
- Pastikan password sudah benar

### Error: "Database not found"
- Gunakan `defaultdb` (database default Aiven)
- Atau buat database baru dengan nama `perpustakaan`

### Cold Start Delay
- Normal untuk free tier - service auto-sleep saat idle
- First request mungkin butuh 30-60 detik untuk wake up
- Request berikutnya akan normal

---

## 📈 Upgrade Path

Jika project sudah production-ready dan butuh lebih:
- **Developer Plan**: $5/bulan - Lebih banyak resources
- **Professional Plan**: $19+/bulan - Production-ready dengan backup

---

## ✅ Checklist

- [x] Database Aiven created
- [x] Connection details documented
- [x] Code updated untuk SSL
- [ ] Environment variables set (local)
- [ ] Environment variables set (Vercel)
- [ ] Database schema imported
- [ ] Connection tested
- [ ] Deploy to Vercel
- [ ] Production URL updated

---

## 📞 Need Help?

Jika ada error atau pertanyaan, cek:
1. Aiven Console → Service → Logs
2. Vercel Dashboard → Deployment → Logs
3. Browser Console untuk client-side errors

