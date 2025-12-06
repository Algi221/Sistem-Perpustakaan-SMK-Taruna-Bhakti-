// Script to run migration for reviews table
// Run with: node database/run-migration.js

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

async function runMigration() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'perpustakaan',
      multipleStatements: true
    });

    console.log('Connected to database');

    // Check current structure
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reviews' AND COLUMN_NAME = 'borrowing_id'`,
      [process.env.DB_NAME || 'perpustakaan']
    );

    if (columns.length > 0) {
      const column = columns[0];
      console.log(`Current borrowing_id column: ${column.IS_NULLABLE === 'YES' ? 'NULL allowed' : 'NOT NULL'}`);
      
      if (column.IS_NULLABLE === 'NO') {
        console.log('Running migration...');
        
        // Modify borrowing_id to allow NULL
        await connection.execute('ALTER TABLE reviews MODIFY COLUMN borrowing_id INT NULL');
        console.log('✅ Modified borrowing_id to allow NULL');
        
        // Drop unique constraint if exists
        try {
          await connection.execute('ALTER TABLE reviews DROP INDEX unique_user_book_review');
          console.log('✅ Dropped unique constraint');
        } catch (error) {
          if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
            throw error;
          }
          console.log('⚠️  Unique constraint does not exist (skipping)');
        }
        
        console.log('\n✅ Migration completed successfully!');
      } else {
        console.log('✅ Migration already applied - borrowing_id allows NULL');
      }
    } else {
      console.log('⚠️  Reviews table or borrowing_id column not found');
    }

    // Verify migration
    const [reviews] = await connection.execute(
      'SELECT COUNT(*) as total FROM reviews WHERE borrowing_id IS NULL'
    );
    console.log(`\n📊 Fake reviews in database: ${reviews[0].total}`);

  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed');
    }
  }
}

runMigration()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

