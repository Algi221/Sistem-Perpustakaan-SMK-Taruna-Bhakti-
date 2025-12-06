import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'staff')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 2MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Get current profile image to delete old one
    let oldImagePath = null;
    try {
      if (session.user.role === 'admin') {
        const [admins] = await pool.execute(
          'SELECT profile_image FROM admin WHERE id = ?',
          [session.user.id]
        );
        if (admins.length > 0 && admins[0].profile_image) {
          oldImagePath = admins[0].profile_image;
        }
      } else if (session.user.role === 'staff') {
        const [staff] = await pool.execute(
          'SELECT profile_image FROM staff WHERE id = ?',
          [session.user.id]
        );
        if (staff.length > 0 && staff[0].profile_image) {
          oldImagePath = staff[0].profile_image;
        }
      }
    } catch (error) {
      // Silently handle missing column error (column doesn't exist yet)
      if (error.code === 'ER_BAD_FIELD_ERROR' || error.errno === 1054) {
        // Column doesn't exist, skip getting old image
        oldImagePath = null;
      } else {
        // Re-throw other errors
        throw error;
      }
    }

    // Delete old image if exists
    if (oldImagePath && oldImagePath.startsWith('/uploads/')) {
      try {
        const oldFilePath = path.join(process.cwd(), 'public', oldImagePath);
        await unlink(oldFilePath);
      } catch (error) {
        console.log('Old image not found or already deleted:', error);
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = path.extname(originalName);
    const rolePrefix = session.user.role === 'admin' ? 'admin' : 'staff';
    const filename = `profile_${rolePrefix}_${session.user.id}_${timestamp}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update database
    const imageUrl = `/uploads/${filename}`;
    try {
      if (session.user.role === 'admin') {
        await pool.execute(
          'UPDATE admin SET profile_image = ? WHERE id = ?',
          [imageUrl, session.user.id]
        );
      } else if (session.user.role === 'staff') {
        await pool.execute(
          'UPDATE staff SET profile_image = ? WHERE id = ?',
          [imageUrl, session.user.id]
        );
      }
    } catch (error) {
      // Handle missing column error
      if (error.code === 'ER_BAD_FIELD_ERROR' || error.errno === 1054) {
        // Column doesn't exist, return error asking to run migration
        return NextResponse.json(
          { 
            error: 'Kolom profile_image belum ada di database. Silakan jalankan migration SQL terlebih dahulu.',
            migrationHint: 'Jalankan: ALTER TABLE admin ADD COLUMN profile_image VARCHAR(500) DEFAULT NULL; ALTER TABLE staff ADD COLUMN profile_image VARCHAR(500) DEFAULT NULL;'
          },
          { status: 400 }
        );
      }
      // Re-throw other errors
      throw error;
    }

    return NextResponse.json({
      message: 'Foto profil berhasil diupload',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload gambar' },
      { status: 500 }
    );
  }
}


