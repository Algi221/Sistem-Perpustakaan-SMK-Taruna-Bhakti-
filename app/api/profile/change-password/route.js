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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password saat ini dan password baru diperlukan' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter' },
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

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Password saat ini salah' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, session.user.id]
    );

    return NextResponse.json({
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

