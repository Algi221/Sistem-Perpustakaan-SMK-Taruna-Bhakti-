import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import { bookSuggestionSchema, validationErrorResponse } from '@/lib/validations';

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
    
    // Validate request body dengan Zod
    const validationResult = bookSuggestionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        validationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    const { title, author, isbn, genre, reason } = validationResult.data;

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

