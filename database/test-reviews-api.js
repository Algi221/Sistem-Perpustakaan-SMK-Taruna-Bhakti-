// Test script to verify reviews API is working
// Run with: node database/test-reviews-api.js

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

async function testReviews() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
    });

    console.log('Testing reviews API...\n');

    // Get a random book
    const [books] = await connection.execute('SELECT id, title FROM books LIMIT 1');
    
    if (books.length === 0) {
      console.log('❌ No books found in database');
      return;
    }

    const book = books[0];
    console.log(`Testing with book: ${book.title} (ID: ${book.id})\n`);

    // Test the same query used in API
    const [reviews] = await connection.execute(
      `SELECT r.*, 
              COALESCE(u.name, 'Pengguna') as user_name, 
              COALESCE(u.email, '') as user_email
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.book_id = ?
       ORDER BY r.created_at DESC`,
      [book.id]
    );

    console.log(`Found ${reviews.length} reviews for this book\n`);

    if (reviews.length === 0) {
      console.log('❌ No reviews found!');
      console.log('Checking if reviews exist in database...');
      
      const [allReviews] = await connection.execute(
        'SELECT COUNT(*) as total FROM reviews WHERE book_id = ?',
        [book.id]
      );
      
      console.log(`Total reviews in database for this book: ${allReviews[0].total}`);
      
      if (allReviews[0].total > 0) {
        console.log('\n⚠️  Reviews exist but query might have issue');
        const [testReviews] = await connection.execute(
          'SELECT * FROM reviews WHERE book_id = ? LIMIT 3',
          [book.id]
        );
        console.log('\nSample reviews:', JSON.stringify(testReviews, null, 2));
      }
    } else {
      // Calculate statistics like API does
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

      const ratingBreakdown = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      };

      console.log('✅ Reviews found!');
      console.log(`\n📊 Statistics:`);
      console.log(`Total reviews: ${totalReviews}`);
      console.log(`Average rating: ${averageRating.toFixed(2)}`);
      console.log(`Rating breakdown:`, ratingBreakdown);
      
      console.log(`\n📝 Sample reviews:`);
      reviews.slice(0, 3).forEach((review, idx) => {
        console.log(`\n${idx + 1}. ${review.user_name} - ${review.rating}⭐`);
        console.log(`   Review: ${review.review || '(no text)'}`);
        console.log(`   Borrowing ID: ${review.borrowing_id || 'NULL (fake review)'}`);
      });
    }

    // Check overall stats
    const [stats] = await connection.execute(
      'SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM reviews'
    );
    
    console.log(`\n\n📈 Overall Database Stats:`);
    console.log(`Total reviews in database: ${stats[0].total}`);
    console.log(`Average rating: ${parseFloat(stats[0].avg_rating).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testReviews()
  .then(() => {
    console.log('\n✨ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

