import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

export async function PATCH(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, address } = body;

    // Update user profile based on role
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (phone !== undefined && (session.user.role === 'staff' || session.user.role === 'siswa' || session.user.role === 'umum')) {
      updateFields.push('phone = ?');
      updateValues.push(phone || null);
    }

    if (address !== undefined && (session.user.role === 'siswa' || session.user.role === 'umum')) {
      updateFields.push('address = ?');
      updateValues.push(address || null);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diupdate' },
        { status: 400 }
      );
    }

    updateValues.push(session.user.id);

    // Update based on role
    if (session.user.role === 'admin') {
      await pool.execute(
        `UPDATE admin SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      // Get updated admin data
      const [admins] = await pool.execute(
        'SELECT id, name, email, created_at FROM admin WHERE id = ?',
        [session.user.id]
      );
      // Try to get profile_image separately if column exists
      let profileImage = null;
      try {
        const [adminWithImage] = await pool.execute(
          'SELECT profile_image FROM admin WHERE id = ?',
          [session.user.id]
        );
        profileImage = adminWithImage[0]?.profile_image || null;
      } catch {
        profileImage = null;
      }
      return NextResponse.json({
        message: 'Profil berhasil diperbarui',
        user: { ...admins[0], profile_image: profileImage, role: 'admin' }
      });
    } else if (session.user.role === 'staff') {
      await pool.execute(
        `UPDATE staff SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      // Get updated staff data
      const [staff] = await pool.execute(
        'SELECT id, name, email, phone, created_at FROM staff WHERE id = ?',
        [session.user.id]
      );
      // Try to get profile_image separately if column exists
      let profileImage = null;
      try {
        const [staffWithImage] = await pool.execute(
          'SELECT profile_image FROM staff WHERE id = ?',
          [session.user.id]
        );
        profileImage = staffWithImage[0]?.profile_image || null;
      } catch {
        profileImage = null;
      }
      return NextResponse.json({
        message: 'Profil berhasil diperbarui',
        user: { ...staff[0], profile_image: profileImage, role: 'staff' }
      });
    } else {
      // For siswa/umum
      await pool.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
      // Get updated user data
      const [users] = await pool.execute(
        'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?',
        [session.user.id]
      );
      return NextResponse.json({
        message: 'Profil berhasil diperbarui',
        user: users[0]
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

