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

    // Check if already in cart
    const [existing] = await pool.execute(
      'SELECT * FROM cart WHERE user_id = ? AND book_id = ?',
      [session.user.id, bookId]
    );

    if (existing.length > 0) {
      // Remove from cart
      await pool.execute(
        'DELETE FROM cart WHERE user_id = ? AND book_id = ?',
        [session.user.id, bookId]
      );
      return NextResponse.json({ message: 'Buku dihapus dari keranjang', inCart: false });
    } else {
      // Add to cart
      await pool.execute(
        'INSERT INTO cart (user_id, book_id) VALUES (?, ?)',
        [session.user.id, bookId]
      );
      return NextResponse.json({ message: 'Buku ditambahkan ke keranjang', inCart: true });
    }
  } catch (error) {
    console.error('Error managing cart:', error);
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

    const [cartItems] = await pool.execute(
      `SELECT b.* FROM books b
       JOIN cart c ON b.id = c.book_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

