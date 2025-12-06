import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone, address } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.execute(
      'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'siswa', phone || null, address || null]
    );

    return NextResponse.json(
      { message: 'Registrasi berhasil' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}

