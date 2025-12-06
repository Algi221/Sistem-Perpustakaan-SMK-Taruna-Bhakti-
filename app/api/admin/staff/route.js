import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [staff] = await pool.execute(
      'SELECT id, name, email, phone, created_at, updated_at FROM staff ORDER BY created_at DESC'
    );

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT * FROM staff WHERE email = ?',
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

    // Insert new staff
    const [result] = await pool.execute(
      'INSERT INTO staff (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null]
    );

    const [newStaff] = await pool.execute(
      'SELECT id, name, email, phone, created_at, updated_at FROM staff WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(
      { staff: newStaff[0], message: 'Petugas berhasil ditambahkan' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

