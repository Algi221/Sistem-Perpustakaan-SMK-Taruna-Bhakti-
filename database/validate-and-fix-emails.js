/**
 * Script untuk mengecek dan memperbaiki email yang tidak valid di database
 * 
 * Usage:
 * node database/validate-and-fix-emails.js
 * 
 * Script ini akan:
 * 1. Mengecek semua email di tabel users, staff, dan admin
 * 2. Mencoba memperbaiki email yang bisa diperbaiki (trim, lowercase)
 * 3. Melaporkan email yang tidak valid dan tidak bisa diperbaiki
 */

const mysql = require('mysql2/promise');
const { z } = require('zod');
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

// Create database connection
const dbHost = process.env.DB_HOST || '127.0.0.1';
const normalizedHost = dbHost === 'localhost' ? '127.0.0.1' : dbHost;
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
  ssl: isAiven
    ? {
        rejectUnauthorized: false
      }
    : false
});

// Schema untuk validasi email
const emailSchema = z.string()
  .email('Format email tidak valid')
  .max(255, 'Email maksimal 255 karakter');

async function validateAndFixEmails() {
  try {
    console.log('🔍 Starting email validation and fix process...\n');
    
    // ========== USERS TABLE ==========
    console.log('📋 Checking emails in users table...');
    const [users] = await pool.execute('SELECT id, email, name FROM users');
    
    const invalidEmails = [];
    const fixedEmails = [];
    const skippedEmails = [];
    
    for (const user of users) {
      if (!user.email || user.email.trim() === '') {
        skippedEmails.push({
          id: user.id,
          name: user.name,
          email: user.email,
          reason: 'Email kosong'
        });
        continue;
      }
      
      const validation = emailSchema.safeParse(user.email);
      
      if (!validation.success) {
        // Coba fix email (trim, lowercase, remove extra spaces)
        let fixedEmail = user.email.trim().toLowerCase();
        // Remove multiple spaces
        fixedEmail = fixedEmail.replace(/\s+/g, ' ');
        // Remove spaces around @
        fixedEmail = fixedEmail.replace(/\s*@\s*/g, '@');
        
        const fixedValidation = emailSchema.safeParse(fixedEmail);
        
        if (fixedValidation.success && fixedEmail !== user.email) {
          // Check if fixed email already exists
          const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [fixedEmail, user.id]
          );
          
          if (existing.length === 0) {
            await pool.execute(
              'UPDATE users SET email = ? WHERE id = ?',
              [fixedEmail, user.id]
            );
            fixedEmails.push({
              id: user.id,
              name: user.name,
              old: user.email,
              new: fixedEmail
            });
            console.log(`  ✅ Fixed: ${user.email} → ${fixedEmail}`);
          } else {
            invalidEmails.push({
              id: user.id,
              name: user.name,
              email: user.email,
              table: 'users',
              errors: validation.error.errors,
              reason: 'Fixed email already exists'
            });
          }
        } else {
          invalidEmails.push({
            id: user.id,
            name: user.name,
            email: user.email,
            table: 'users',
            errors: validation.error.errors
          });
        }
      }
    }
    
    // ========== STAFF TABLE ==========
    console.log('\n📋 Checking emails in staff table...');
    const [staff] = await pool.execute('SELECT id, email, name FROM staff');
    
    for (const s of staff) {
      if (!s.email || s.email.trim() === '') {
        skippedEmails.push({
          id: s.id,
          name: s.name,
          email: s.email,
          table: 'staff',
          reason: 'Email kosong'
        });
        continue;
      }
      
      const validation = emailSchema.safeParse(s.email);
      
      if (!validation.success) {
        let fixedEmail = s.email.trim().toLowerCase();
        fixedEmail = fixedEmail.replace(/\s+/g, ' ');
        fixedEmail = fixedEmail.replace(/\s*@\s*/g, '@');
        
        const fixedValidation = emailSchema.safeParse(fixedEmail);
        
        if (fixedValidation.success && fixedEmail !== s.email) {
          const [existing] = await pool.execute(
            'SELECT id FROM staff WHERE email = ? AND id != ?',
            [fixedEmail, s.id]
          );
          
          if (existing.length === 0) {
            await pool.execute(
              'UPDATE staff SET email = ? WHERE id = ?',
              [fixedEmail, s.id]
            );
            fixedEmails.push({
              id: s.id,
              name: s.name,
              old: s.email,
              new: fixedEmail,
              table: 'staff'
            });
            console.log(`  ✅ Fixed: ${s.email} → ${fixedEmail}`);
          } else {
            invalidEmails.push({
              id: s.id,
              name: s.name,
              email: s.email,
              table: 'staff',
              errors: validation.error.errors,
              reason: 'Fixed email already exists'
            });
          }
        } else {
          invalidEmails.push({
            id: s.id,
            name: s.name,
            email: s.email,
            table: 'staff',
            errors: validation.error.errors
          });
        }
      }
    }
    
    // ========== ADMIN TABLE ==========
    console.log('\n📋 Checking emails in admin table...');
    const [admins] = await pool.execute('SELECT id, email, name FROM admin');
    
    for (const admin of admins) {
      if (!admin.email || admin.email.trim() === '') {
        skippedEmails.push({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          table: 'admin',
          reason: 'Email kosong'
        });
        continue;
      }
      
      const validation = emailSchema.safeParse(admin.email);
      
      if (!validation.success) {
        let fixedEmail = admin.email.trim().toLowerCase();
        fixedEmail = fixedEmail.replace(/\s+/g, ' ');
        fixedEmail = fixedEmail.replace(/\s*@\s*/g, '@');
        
        const fixedValidation = emailSchema.safeParse(fixedEmail);
        
        if (fixedValidation.success && fixedEmail !== admin.email) {
          const [existing] = await pool.execute(
            'SELECT id FROM admin WHERE email = ? AND id != ?',
            [fixedEmail, admin.id]
          );
          
          if (existing.length === 0) {
            await pool.execute(
              'UPDATE admin SET email = ? WHERE id = ?',
              [fixedEmail, admin.id]
            );
            fixedEmails.push({
              id: admin.id,
              name: admin.name,
              old: admin.email,
              new: fixedEmail,
              table: 'admin'
            });
            console.log(`  ✅ Fixed: ${admin.email} → ${fixedEmail}`);
          } else {
            invalidEmails.push({
              id: admin.id,
              name: admin.name,
              email: admin.email,
              table: 'admin',
              errors: validation.error.errors,
              reason: 'Fixed email already exists'
            });
          }
        } else {
          invalidEmails.push({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            table: 'admin',
            errors: validation.error.errors
          });
        }
      }
    }
    
    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Fixed emails: ${fixedEmails.length}`);
    console.log(`❌ Invalid emails (need manual fix): ${invalidEmails.length}`);
    console.log(`⚠️  Skipped emails (empty): ${skippedEmails.length}`);
    
    if (invalidEmails.length > 0) {
      console.log('\n❌ Invalid emails that need manual fix:');
      console.log('-'.repeat(60));
      invalidEmails.forEach((item, index) => {
        console.log(`\n${index + 1}. Table: ${item.table || 'users'}`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Name: ${item.name}`);
        console.log(`   Email: ${item.email}`);
        if (item.reason) {
          console.log(`   Reason: ${item.reason}`);
        }
        console.log(`   Errors: ${JSON.stringify(item.errors, null, 2)}`);
      });
    }
    
    if (skippedEmails.length > 0) {
      console.log('\n⚠️  Skipped emails (empty):');
      console.log('-'.repeat(60));
      skippedEmails.forEach((item, index) => {
        console.log(`${index + 1}. Table: ${item.table || 'users'}, ID: ${item.id}, Name: ${item.name}`);
      });
    }
    
    if (fixedEmails.length > 0) {
      console.log('\n✅ Successfully fixed emails:');
      console.log('-'.repeat(60));
      fixedEmails.forEach((item, index) => {
        console.log(`${index + 1}. Table: ${item.table || 'users'}, ID: ${item.id}`);
        console.log(`   ${item.old} → ${item.new}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Process completed!');
    
    // Close database connection
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Stack:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  validateAndFixEmails();
}

module.exports = { validateAndFixEmails };

