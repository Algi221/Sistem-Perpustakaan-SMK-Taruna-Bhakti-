/**
 * Script untuk setup test data pembayaran denda
 * User: Algi Nonchalant, terlambat 1 hari (denda Rp 2.000)
 * 
 * Cara pakai:
 * node database/setup-test-fine.js
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

loadEnv();

async function setupTestFine() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
    });

    console.log('✅ Connected to database\n');

    // Step 1: Cari user Algi Nonchalant
    console.log('🔍 Mencari user "Algi Nonchalant"...');
    const [users] = await connection.execute(
      `SELECT id, name, email FROM users 
       WHERE name LIKE ? OR name LIKE ? OR email LIKE ?`,
      ['%Algi%', '%Nonchalant%', '%algi%']
    );

    if (users.length === 0) {
      console.log('❌ User "Algi Nonchalant" tidak ditemukan!');
      console.log('\nDaftar semua user:');
      const [allUsers] = await connection.execute('SELECT id, name, email FROM users LIMIT 10');
      allUsers.forEach(u => console.log(`  - ${u.name} (ID: ${u.id}, Email: ${u.email})`));
      return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.name} (ID: ${user.id}, Email: ${user.email})\n`);

    // Step 2: Cari buku
    console.log('🔍 Mencari buku...');
    const [books] = await connection.execute('SELECT id, title FROM books LIMIT 1');
    
    if (books.length === 0) {
      console.log('❌ Tidak ada buku di database!');
      return;
    }

    const book = books[0];
    console.log(`✅ Found book: ${book.title} (ID: ${book.id})\n`);

    // Step 3: Cek apakah sudah ada borrowing untuk user ini
    const [existingBorrowings] = await connection.execute(
      `SELECT id, status, fine_amount, fine_days, fine_paid 
       FROM borrowings 
       WHERE user_id = ? 
       ORDER BY id DESC 
       LIMIT 1`,
      [user.id]
    );

    let borrowingId;

    if (existingBorrowings.length > 0) {
      // Update borrowing yang sudah ada
      borrowingId = existingBorrowings[0].id;
      console.log(`📝 Update borrowing ID: ${borrowingId}...`);
      
      await connection.execute(
        `UPDATE borrowings 
         SET 
           book_id = ?,
           due_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY),
           return_date = CURDATE(),
           status = 'returned',
           fine_amount = 2000,
           fine_days = 1,
           fine_paid = FALSE,
           fine_paid_at = NULL,
           xendit_invoice_id = NULL,
           xendit_payment_status = NULL,
           updated_at = NOW()
         WHERE id = ?`,
        [book.id, borrowingId]
      );
      
      console.log('✅ Borrowing updated!\n');
    } else {
      // Buat borrowing baru
      console.log('📝 Creating new borrowing...');
      
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
           created_at,
           updated_at
         ) VALUES (?, ?, DATE_SUB(CURDATE(), INTERVAL 8 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY), CURDATE(), 'returned', 2000, 1, FALSE, NOW(), NOW())`,
        [user.id, book.id]
      );
      
      borrowingId = result.insertId;
      console.log(`✅ Borrowing created! ID: ${borrowingId}\n`);
    }

    // Step 4: Verifikasi hasil
    console.log('📊 Verifikasi data:');
    const [verify] = await connection.execute(
      `SELECT 
         b.id,
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
         DATEDIFF(b.return_date, b.due_date) as days_late
       FROM borrowings b
       JOIN users u ON b.user_id = u.id
       JOIN books bk ON b.book_id = bk.id
       WHERE b.id = ?`,
      [borrowingId]
    );

    if (verify.length > 0) {
      const data = verify[0];
      console.log('\n' + '='.repeat(60));
      console.log('📋 DATA TEST PEMBAYARAN DENDA');
      console.log('='.repeat(60));
      console.log(`User          : ${data.user_name} (${data.email})`);
      console.log(`Buku          : ${data.book_title}`);
      console.log(`Borrow Date   : ${data.borrow_date}`);
      console.log(`Due Date      : ${data.due_date} (kemarin)`);
      console.log(`Return Date   : ${data.return_date} (hari ini)`);
      console.log(`Status        : ${data.status}`);
      console.log(`Hari Terlambat: ${data.days_late} hari`);
      console.log(`Denda         : Rp ${data.fine_amount.toLocaleString('id-ID')}`);
      console.log(`Sudah Dibayar : ${data.fine_paid ? 'Ya' : 'Belum'}`);
      console.log('='.repeat(60));
      console.log('\n✅ Test data siap!');
      console.log('💡 Login sebagai user tersebut dan cek halaman peminjaman untuk melihat denda.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      console.error('\n⚠️  Pastikan sudah menjalankan migration database!');
      console.error('   Jalankan: source database/add_fine_system.sql;');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupTestFine();

