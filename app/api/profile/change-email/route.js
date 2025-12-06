import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newEmail, password } = body;

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'Email baru dan password diperlukan' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND id != ?',
      [newEmail, session.user.id]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 400 }
      );
    }

    // Get current user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [session.user.id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 400 }
      );
    }

    // Update email
    await pool.execute(
      'UPDATE users SET email = ? WHERE id = ?',
      [newEmail, session.user.id]
    );

    return NextResponse.json({
      message: 'Email berhasil diubah'
    });
  } catch (error) {
    console.error('Error changing email:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

