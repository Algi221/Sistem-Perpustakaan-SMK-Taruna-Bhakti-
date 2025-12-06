import mysql from 'mysql2/promise';

// Force IPv4 by converting localhost to 127.0.0.1
const dbHost = process.env.DB_HOST || '127.0.0.1';
const normalizedHost = dbHost === 'localhost' ? '127.0.0.1' : dbHost;

const pool = mysql.createPool({
  host: normalizedHost,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'perpustakaan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

