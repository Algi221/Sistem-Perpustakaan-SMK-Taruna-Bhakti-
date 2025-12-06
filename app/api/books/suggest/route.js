import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

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
    const { title, author, isbn, genre, reason } = body;

    if (!title || !author || !genre || !reason) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Simpan usulan buku (bisa dibuat tabel book_suggestions jika diperlukan)
    // Untuk sekarang, kita hanya return success
    // TODO: Buat tabel book_suggestions untuk menyimpan usulan

    return NextResponse.json({
      message: 'Usulan buku berhasil dikirim'
    });
  } catch (error) {
    console.error('Error suggesting book:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

