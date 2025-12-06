// Script to run migration for return_requested status
// Run with: node database/run-return-request-migration.js

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

    // Check current enum values
    const [columns] = await connection.execute(
      `SELECT COLUMN_TYPE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'borrowings' AND COLUMN_NAME = 'status'`,
      [process.env.DB_NAME || 'perpustakaan']
    );

    if (columns.length > 0) {
      const columnType = columns[0].COLUMN_TYPE;
      console.log(`Current status enum: ${columnType}`);
      
      if (!columnType.includes('return_requested')) {
        console.log('Running migration to add return_requested status...');
        
        // Modify status enum to include return_requested
        await connection.execute(
          `ALTER TABLE borrowings MODIFY COLUMN status ENUM('pending', 'approved', 'borrowed', 'return_requested', 'returned', 'rejected') DEFAULT 'pending'`
        );
        
        console.log('✅ Migration completed successfully!');
        console.log('Status enum now includes: pending, approved, borrowed, return_requested, returned, rejected');
      } else {
        console.log('✅ Migration already applied - return_requested status exists');
      }
    } else {
      console.log('⚠️  Borrowings table or status column not found');
    }

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

