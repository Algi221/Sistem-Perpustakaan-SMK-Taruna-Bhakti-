import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import { z } from 'zod';

const emailSchema = z.string()
  .email('Format email tidak valid')
  .max(255, 'Email maksimal 255 karakter');

const fixEmailSchema = z.object({
  userId: z.coerce.number().int().positive(),
  newEmail: z.string().email().max(255),
  table: z.enum(['users', 'staff', 'admin']).default('users'),
});

// GET - List invalid emails
export async function GET(request) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const invalidEmails = [];
    
    // Check users table
    const [users] = await pool.execute('SELECT id, email, name FROM users');
    for (const user of users) {
      if (!user.email) continue;
      const validation = emailSchema.safeParse(user.email);
      if (!validation.success) {
        invalidEmails.push({
          id: user.id,
          name: user.name,
          email: user.email,
          table: 'users',
          errors: validation.error.errors
        });
      }
    }
    
    // Check staff table
    const [staff] = await pool.execute('SELECT id, email, name FROM staff');
    for (const s of staff) {
      if (!s.email) continue;
      const validation = emailSchema.safeParse(s.email);
      if (!validation.success) {
        invalidEmails.push({
          id: s.id,
          name: s.name,
          email: s.email,
          table: 'staff',
          errors: validation.error.errors
        });
      }
    }
    
    // Check admin table
    const [admins] = await pool.execute('SELECT id, email, name FROM admin');
    for (const admin of admins) {
      if (!admin.email) continue;
      const validation = emailSchema.safeParse(admin.email);
      if (!validation.success) {
        invalidEmails.push({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          table: 'admin',
          errors: validation.error.errors
        });
      }
    }
    
    return NextResponse.json({
      invalidEmails,
      count: invalidEmails.length
    });
  } catch (error) {
    console.error('Error getting invalid emails:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

// POST - Fix invalid email
export async function POST(request) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate request body
    const validationResult = fixEmailSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }
    
    const { userId, newEmail, table } = validationResult.data;
    
    // Validate new email format
    const emailValidation = emailSchema.safeParse(newEmail);
    if (!emailValidation.success) {
      return NextResponse.json(
        {
          error: 'Format email tidak valid',
          details: emailValidation.error.errors
        },
        { status: 400 }
      );
    }
    
    // Check if email already exists in the same table
    let checkQuery = '';
    if (table === 'users') {
      checkQuery = 'SELECT id FROM users WHERE email = ? AND id != ?';
    } else if (table === 'staff') {
      checkQuery = 'SELECT id FROM staff WHERE email = ? AND id != ?';
    } else if (table === 'admin') {
      checkQuery = 'SELECT id FROM admin WHERE email = ? AND id != ?';
    }
    
    const [existing] = await pool.execute(checkQuery, [newEmail, userId]);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah digunakan di tabel ' + table },
        { status: 400 }
      );
    }
    
    // Check if email exists in other tables
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [newEmail]);
    const [existingStaff] = await pool.execute('SELECT id FROM staff WHERE email = ?', [newEmail]);
    const [existingAdmin] = await pool.execute('SELECT id FROM admin WHERE email = ?', [newEmail]);
    
    if (existingUsers.length > 0 || existingStaff.length > 0 || existingAdmin.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah digunakan di tabel lain' },
        { status: 400 }
      );
    }
    
    // Update email
    let updateQuery = '';
    if (table === 'users') {
      updateQuery = 'UPDATE users SET email = ? WHERE id = ?';
    } else if (table === 'staff') {
      updateQuery = 'UPDATE staff SET email = ? WHERE id = ?';
    } else if (table === 'admin') {
      updateQuery = 'UPDATE admin SET email = ? WHERE id = ?';
    }
    
    await pool.execute(updateQuery, [newEmail, userId]);
    
    return NextResponse.json({
      message: 'Email berhasil diperbarui',
      userId,
      newEmail,
      table
    });
  } catch (error) {
    console.error('Error fixing email:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

