/**
 * Script untuk menjalankan migration password_reset_requests table
 * Usage: node database/run-password-reset-migration.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;

  try {
    // Baca environment variables
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'perpustakaan';

    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Baca SQL file
    const sqlFile = path.join(__dirname, 'create_password_reset_requests.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Running migration...');
    await connection.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('📋 Table password_reset_requests has been created.');

    // Verify table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'password_reset_requests'"
    );

    if (tables.length > 0) {
      console.log('✅ Table verification: password_reset_requests exists');
    } else {
      console.log('⚠️  Warning: Table verification failed');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('ℹ️  Table already exists, skipping...');
    } else {
      console.error('Error details:', error);
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigration();

