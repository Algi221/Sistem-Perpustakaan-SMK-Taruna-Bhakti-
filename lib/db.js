import mysql from 'mysql2/promise';

// Force IPv4 by converting localhost to 127.0.0.1
const dbHost = process.env.DB_HOST || '127.0.0.1';
const normalizedHost = dbHost === 'localhost' ? '127.0.0.1' : dbHost;

// Check if connecting to Aiven (requires SSL)
const isAiven = dbHost.includes('aivencloud.com') || dbHost.includes('aiven');

const pool = mysql.createPool({
  host: normalizedHost,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'perpustakaan',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Aiven requires SSL connection
  ssl: isAiven
    ? {
        rejectUnauthorized: false // Aiven uses self-signed certificates
      }
    : false
});

export default pool;

