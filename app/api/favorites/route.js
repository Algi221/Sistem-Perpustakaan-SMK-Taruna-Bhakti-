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
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID diperlukan' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const [existing] = await pool.execute(
      'SELECT * FROM favorites WHERE user_id = ? AND book_id = ?',
      [session.user.id, bookId]
    );

    if (existing.length > 0) {
      // Remove from favorites
      await pool.execute(
        'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
        [session.user.id, bookId]
      );
      return NextResponse.json({ message: 'Buku dihapus dari favorit', isFavorite: false });
    } else {
      // Add to favorites
      await pool.execute(
        'INSERT INTO favorites (user_id, book_id) VALUES (?, ?)',
        [session.user.id, bookId]
      );
      return NextResponse.json({ message: 'Buku ditambahkan ke favorit', isFavorite: true });
    }
  } catch (error) {
    console.error('Error managing favorite:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (bookId) {
      // Check if book is favorited
      const [favorites] = await pool.execute(
        'SELECT * FROM favorites WHERE user_id = ? AND book_id = ?',
        [session.user.id, bookId]
      );
      return NextResponse.json({ isFavorite: favorites.length > 0 });
    }

    // Get all favorites
    const [favorites] = await pool.execute(
      `SELECT b.* FROM books b
       JOIN favorites f ON b.id = f.book_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

