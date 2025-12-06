// Script to update borrowing status for Algi Nonchalant's Lord of the Flies borrowing
// Run with: node database/update-borrowing-status.js

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

async function updateBorrowingStatus() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
    });

    console.log('Connected to database\n');

    // Find user Algi Nonchalant
    const [users] = await connection.execute(
      'SELECT id, name, email FROM users WHERE name LIKE ?',
      ['%Algi%Nonchalant%']
    );

    if (users.length === 0) {
      console.log('❌ User "Algi Nonchalant" not found');
      console.log('Searching for similar names...');
      
      const [allUsers] = await connection.execute(
        'SELECT id, name, email FROM users WHERE name LIKE ? OR name LIKE ?',
        ['%Algi%', '%Nonchalant%']
      );
      
      if (allUsers.length > 0) {
        console.log('\nFound similar users:');
        allUsers.forEach(u => console.log(`  - ${u.name} (ID: ${u.id}, Email: ${u.email})`));
      }
      return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.name} (ID: ${user.id}, Email: ${user.email})\n`);

    // Find book "Lord of the Flies"
    const [books] = await connection.execute(
      'SELECT id, title, author FROM books WHERE title LIKE ?',
      ['%Lord of the Flies%']
    );

    if (books.length === 0) {
      console.log('❌ Book "Lord of the Flies" not found');
      return;
    }

    const book = books[0];
    console.log(`✅ Found book: ${book.title} by ${book.author} (ID: ${book.id})\n`);

    // Find active borrowings for this user and book
    const [borrowings] = await connection.execute(
      `SELECT id, borrow_date, due_date, return_date, status, created_at
       FROM borrowings 
       WHERE user_id = ? AND book_id = ? 
       AND status IN ('pending', 'approved', 'borrowed')
       ORDER BY created_at DESC`,
      [user.id, book.id]
    );

    if (borrowings.length === 0) {
      console.log('❌ No active borrowing found for this user and book');
      console.log('Checking all borrowings...');
      
      const [allBorrowings] = await connection.execute(
        `SELECT id, borrow_date, due_date, return_date, status, created_at
         FROM borrowings 
         WHERE user_id = ? AND book_id = ?
         ORDER BY created_at DESC`,
        [user.id, book.id]
      );
      
      if (allBorrowings.length > 0) {
        console.log('\nFound borrowings:');
        allBorrowings.forEach(b => {
          console.log(`  - ID: ${b.id}, Status: ${b.status}, Borrow Date: ${b.borrow_date}, Due Date: ${b.due_date}`);
        });
      } else {
        console.log('No borrowings found at all for this user and book');
      }
      return;
    }

    const borrowing = borrowings[0];
    console.log(`✅ Found borrowing:`);
    console.log(`   ID: ${borrowing.id}`);
    console.log(`   Status: ${borrowing.status}`);
    console.log(`   Borrow Date: ${borrowing.borrow_date}`);
    console.log(`   Due Date: ${borrowing.due_date}`);
    console.log(`   Return Date: ${borrowing.return_date || 'Not returned yet'}\n`);

    // Update borrowing status to 'returned'
    const returnDate = new Date().toISOString().split('T')[0]; // Today's date
    
    await connection.execute(
      `UPDATE borrowings 
       SET status = 'returned', 
           return_date = ?
       WHERE id = ?`,
      [returnDate, borrowing.id]
    );

    console.log(`✅ Updated borrowing status to 'returned'`);
    console.log(`   Return Date: ${returnDate}\n`);

    // Verify update
    const [updatedBorrowing] = await connection.execute(
      'SELECT id, status, return_date FROM borrowings WHERE id = ?',
      [borrowing.id]
    );

    console.log('📋 Updated borrowing details:');
    console.log(`   ID: ${updatedBorrowing[0].id}`);
    console.log(`   Status: ${updatedBorrowing[0].status}`);
    console.log(`   Return Date: ${updatedBorrowing[0].return_date}\n`);

    // Check if user can now review
    console.log('✅ User can now give a review for this book!');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Book ID: ${book.id}`);
    console.log(`   Borrowing ID: ${borrowing.id}\n`);

    // Check if user already reviewed
    const [existingReviews] = await connection.execute(
      `SELECT id, rating, review, created_at 
       FROM reviews 
       WHERE user_id = ? AND book_id = ? AND borrowing_id = ?`,
      [user.id, book.id, borrowing.id]
    );

    if (existingReviews.length > 0) {
      console.log('ℹ️  User already has a review for this borrowing:');
      existingReviews.forEach(r => {
        console.log(`   Rating: ${r.rating}⭐`);
        console.log(`   Review: ${r.review || '(no text)'}`);
        console.log(`   Created: ${r.created_at}`);
      });
    } else {
      console.log('✅ User can now add a new review through the review system');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

updateBorrowingStatus()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

