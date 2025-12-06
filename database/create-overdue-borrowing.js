/**
 * Script untuk membuat 1 buku terlambat dengan denda untuk user ALgi Nonchalant
 * Buku masih dipinjam (belum dikembalikan) dan sudah melewati due date
 * 
 * Cara pakai:
 * node database/create-overdue-borrowing.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    });
  }
}

/**
 * Menghitung jumlah hari keterlambatan
 */
function calculateLateDays(dueDate) {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Menghitung total denda berdasarkan hari keterlambatan
 * Formula: 2000 * (2 ^ (days - 1))
 */
function calculateFine(lateDays) {
  if (lateDays <= 0) {
    return 0;
  }
  
  const baseFine = 2000;
  const fine = baseFine * Math.pow(2, lateDays - 1);
  
  return Math.round(fine);
}

loadEnv();

async function createOverdueBorrowing() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
    });

    console.log('✅ Connected to database\n');

    // Step 1: Cari user ALgi Nonchalant
    console.log('🔍 Mencari user "ALgi Nonchalant"...');
    const [users] = await connection.execute(
      `SELECT id, name, email FROM users 
       WHERE name LIKE ? OR name LIKE ? OR email LIKE ?`,
      ['%ALgi%', '%Nonchalant%', '%algi%']
    );

    if (users.length === 0) {
      console.log('❌ User "ALgi Nonchalant" tidak ditemukan!');
      console.log('\nDaftar semua user:');
      const [allUsers] = await connection.execute('SELECT id, name, email FROM users LIMIT 10');
      allUsers.forEach(u => console.log(`  - ${u.name} (ID: ${u.id}, Email: ${u.email})`));
      return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.name} (ID: ${user.id}, Email: ${user.email})\n`);

    // Step 2: Cari buku yang tersedia
    console.log('🔍 Mencari buku yang tersedia...');
    const [books] = await connection.execute(
      `SELECT id, title, author, available FROM books 
       WHERE available > 0 
       ORDER BY id DESC 
       LIMIT 1`
    );
    
    if (books.length === 0) {
      console.log('⚠️  Tidak ada buku tersedia, mencari buku apapun...');
      const [anyBooks] = await connection.execute('SELECT id, title, author FROM books LIMIT 1');
      if (anyBooks.length === 0) {
        console.log('❌ Tidak ada buku di database!');
        return;
      }
      var book = anyBooks[0];
    } else {
      var book = books[0];
    }
    
    console.log(`✅ Found book: ${book.title} by ${book.author} (ID: ${book.id})\n`);

    // Step 3: Hitung denda (misalnya terlambat 2 hari)
    const daysOverdue = 2; // Terlambat 2 hari
    const fineAmount = calculateFine(daysOverdue);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - daysOverdue);
    const borrowDate = new Date(dueDate);
    borrowDate.setDate(borrowDate.getDate() - 5); // Pinjam 5 hari sebelum due date

    console.log(`📅 Borrow Date: ${borrowDate.toISOString().split('T')[0]}`);
    console.log(`📅 Due Date: ${dueDate.toISOString().split('T')[0]} (${daysOverdue} hari yang lalu)`);
    console.log(`💰 Fine Amount: Rp ${fineAmount.toLocaleString('id-ID')}`);
    console.log(`📊 Fine Days: ${daysOverdue} hari\n`);

    // Step 4: Buat borrowing baru yang terlambat
    console.log('📝 Creating overdue borrowing...');
    
    const [result] = await connection.execute(
      `INSERT INTO borrowings (
         user_id, 
         book_id, 
         borrow_date, 
         due_date, 
         return_date, 
         status, 
         fine_amount, 
         fine_days, 
         fine_paid,
         fine_paid_at,
         xendit_invoice_id,
         xendit_payment_status,
         created_at,
         updated_at
       ) VALUES (?, ?, ?, ?, NULL, 'borrowed', ?, ?, FALSE, NULL, NULL, NULL, NOW(), NOW())`,
      [
        user.id, 
        book.id, 
        borrowDate.toISOString().split('T')[0], 
        dueDate.toISOString().split('T')[0],
        fineAmount,
        daysOverdue
      ]
    );
    
    const borrowingId = result.insertId;
    console.log(`✅ Overdue borrowing created! ID: ${borrowingId}\n`);

    // Step 5: Update stok buku (kurangi available)
    if (book.available > 0) {
      await connection.execute(
        `UPDATE books SET available = available - 1 WHERE id = ?`,
        [book.id]
      );
      console.log(`✅ Book stock updated (available decreased)\n`);
    }

    // Step 6: Verifikasi hasil
    console.log('📊 Verifikasi data:');
    const [verify] = await connection.execute(
      `SELECT 
         b.id,
         u.name as user_name,
         u.email,
         bk.title as book_title,
         bk.author as book_author,
         b.borrow_date,
         b.due_date,
         b.return_date,
         b.status,
         b.fine_amount,
         b.fine_days,
         b.fine_paid,
         DATEDIFF(CURDATE(), b.due_date) as days_late
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.id = ?`,
      [borrowingId]
    );

    if (verify.length > 0) {
      const data = verify[0];
      console.log('\n' + '='.repeat(60));
      console.log('📋 DATA PEMINJAMAN TERLAMBAT');
      console.log('='.repeat(60));
      console.log(`User          : ${data.user_name} (${data.email})`);
      console.log(`Buku          : ${data.book_title} by ${data.book_author}`);
      console.log(`Borrow Date   : ${data.borrow_date}`);
      console.log(`Due Date      : ${data.due_date} (${data.days_late} hari yang lalu)`);
      console.log(`Return Date   : ${data.return_date || 'Belum dikembalikan'}`);
      console.log(`Status        : ${data.status}`);
      console.log(`Hari Terlambat: ${data.days_late} hari`);
      console.log(`Denda         : Rp ${data.fine_amount.toLocaleString('id-ID')}`);
      console.log(`Sudah Dibayar : ${data.fine_paid ? 'Ya' : 'Belum'}`);
      console.log('='.repeat(60));
      console.log('\n✅ Data peminjaman terlambat berhasil dibuat!');
      console.log('💡 User harus membayar denda sebelum mengembalikan buku.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      console.error('\n⚠️  Pastikan sudah menjalankan migration database!');
      console.error('   Jalankan: mysql -u root -p perpustakaan < database/add_fine_system.sql');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createOverdueBorrowing();

