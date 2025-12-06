import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request, { params }) {
  try {
    const session = await getSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    return NextResponse.json({ message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

