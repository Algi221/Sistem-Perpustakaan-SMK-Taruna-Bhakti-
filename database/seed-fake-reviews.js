// Script to seed fake reviews for all books
// Run with: node database/seed-fake-reviews.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
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

// Review templates in Indonesian
const reviewTemplates = [
  "Buku yang sangat menarik! Ceritanya mengalir dengan baik dan karakter-karakternya sangat hidup.",
  "Saya sangat menikmati membaca buku ini. Plotnya tidak terduga dan membuat saya terus membaca sampai selesai.",
  "Buku yang bagus untuk dibaca. Penulisnya memiliki gaya menulis yang unik dan menarik.",
  "Ceritanya cukup menarik meskipun ada beberapa bagian yang agak lambat. Overall, buku yang layak dibaca.",
  "Buku ini memberikan perspektif baru tentang topik yang dibahas. Sangat direkomendasikan!",
  "Membaca buku ini adalah pengalaman yang menyenangkan. Saya belajar banyak hal baru.",
  "Plotnya sangat menarik dan karakter-karakternya berkembang dengan baik sepanjang cerita.",
  "Buku yang bagus, tapi ada beberapa bagian yang bisa lebih detail lagi.",
  "Saya suka cara penulis menyampaikan pesan dalam buku ini. Sangat inspiratif!",
  "Buku ini layak untuk dibaca. Meskipun tidak sempurna, tapi cukup menghibur.",
  "Ceritanya sangat menarik dari awal sampai akhir. Tidak ada bagian yang membosankan.",
  "Buku yang bagus dengan karakter-karakter yang kuat. Plotnya juga tidak mudah ditebak.",
  "Saya sangat merekomendasikan buku ini untuk semua orang yang suka membaca.",
  "Buku ini memberikan wawasan baru yang sangat berharga. Sangat bermanfaat!",
  "Ceritanya mengalir dengan baik dan mudah diikuti. Karakter-karakternya juga sangat relatable.",
  "Buku yang bagus, meskipun ada beberapa bagian yang agak membingungkan.",
  "Saya menikmati setiap halaman dari buku ini. Sangat menghibur dan informatif.",
  "Plotnya sangat menarik dan membuat saya penasaran sampai akhir cerita.",
  "Buku ini memberikan perspektif yang berbeda tentang topik yang sudah familiar.",
  "Sangat direkomendasikan! Buku ini layak untuk dibaca berulang kali.",
  "Buku klasik yang tidak pernah membosankan. Setiap kali membaca selalu menemukan hal baru.",
  "Penulisnya benar-benar memahami cara menyampaikan cerita dengan baik.",
  "Buku ini memiliki pesan moral yang kuat dan disampaikan dengan cara yang menarik.",
  "Saya terkesan dengan kedalaman karakter-karakter dalam buku ini.",
  "Ceritanya sangat emosional dan membuat saya terharu di beberapa bagian.",
  "Buku yang perfect untuk dibaca di waktu senggang. Sangat menghibur!",
  "Saya suka bagaimana penulis membangun dunia dalam cerita ini.",
  "Buku ini memiliki twist yang tidak terduga di akhir cerita.",
  "Karakter-karakternya sangat well-developed dan mudah untuk diingat.",
  "Buku yang bagus untuk semua kalangan. Baik muda maupun tua akan menikmatinya."
];

// Fake user names for reviews
const fakeUserNames = [
  "Ahmad Rizki",
  "Siti Nurhaliza",
  "Budi Santoso",
  "Dewi Lestari",
  "Eko Prasetyo",
  "Fitri Handayani",
  "Gunawan Wijaya",
  "Hani Kartika",
  "Indra Permana",
  "Jihan Putri",
  "Kurniawan",
  "Lina Marlina",
  "Muhammad Ali",
  "Nurul Hidayati",
  "Oki Setiana",
  "Putri Ayu",
  "Rizki Ramadhan",
  "Sari Dewi",
  "Taufik Hidayat",
  "Umi Kalsum"
];

// Function to get random rating (weighted towards positive)
function getRandomRating() {
  const rand = Math.random();
  if (rand < 0.40) return 5;      // 40% chance
  if (rand < 0.70) return 4;      // 30% chance
  if (rand < 0.90) return 3;      // 20% chance
  if (rand < 0.97) return 2;      // 7% chance
  return 1;                        // 3% chance
}

// Function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to get random number of reviews (2 or 3)
function getReviewCount() {
  return Math.random() < 0.5 ? 2 : 3;
}

async function seedFakeReviews() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      multipleStatements: true
    });

    console.log('Connected to database');

    // Get all books
    const [books] = await connection.execute('SELECT id FROM books ORDER BY id');
    console.log(`Found ${books.length} books`);

    // Get existing users or create fake users
    const [users] = await connection.execute('SELECT id FROM users LIMIT 20');
    
    let userIds = users.map(u => u.id);
    
    // If no users exist, create fake users for reviews
    if (userIds.length === 0) {
      console.log('No users found, creating fake users...');
      for (let i = 0; i < 20; i++) {
        const [result] = await connection.execute(
          `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
          [
            fakeUserNames[i] || `User ${i + 1}`,
            `fakeuser${i + 1}@example.com`,
            '$2b$10$dummyhashforfakereviews', // Dummy password hash
            'siswa'
          ]
        );
        userIds.push(result.insertId);
      }
      console.log(`Created ${userIds.length} fake users`);
    }

    // Clear existing fake reviews (where borrowing_id IS NULL)
    await connection.execute('DELETE FROM reviews WHERE borrowing_id IS NULL');
    console.log('Cleared existing fake reviews');

    // Insert fake reviews for each book
    let totalReviews = 0;
    for (const book of books) {
      const reviewCount = getReviewCount();
      
      for (let i = 0; i < reviewCount; i++) {
        const userId = getRandomItem(userIds);
        const rating = getRandomRating();
        const reviewText = getRandomItem(reviewTemplates);
        
        // Random date within last 6 months
        const daysAgo = Math.floor(Math.random() * 180);
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - daysAgo);
        
        await connection.execute(
          `INSERT INTO reviews (book_id, user_id, borrowing_id, rating, review, created_at) 
           VALUES (?, ?, NULL, ?, ?, ?)`,
          [book.id, userId, rating, reviewText, reviewDate]
        );
        
        totalReviews++;
      }
    }

    console.log(`\n✅ Successfully seeded ${totalReviews} fake reviews for ${books.length} books`);
    console.log(`Average: ${(totalReviews / books.length).toFixed(1)} reviews per book`);

    // Show statistics
    const [stats] = await connection.execute(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(DISTINCT book_id) as books_with_reviews
       FROM reviews 
       WHERE borrowing_id IS NULL`
    );
    
    console.log('\n📊 Statistics:');
    console.log(`Total fake reviews: ${stats[0].total_reviews}`);
    console.log(`Average rating: ${parseFloat(stats[0].avg_rating).toFixed(2)}`);
    console.log(`Books with reviews: ${stats[0].books_with_reviews}`);

  } catch (error) {
    console.error('Error seeding fake reviews:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

// Run the script
seedFakeReviews()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

