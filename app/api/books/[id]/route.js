import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (books.length === 0) {
      return NextResponse.json(
        { error: 'Buku tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(books[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      author,
      isbn,
      genre,
      description,
      image_url,
      stock,
      published_year,
      publisher
    } = body;

    // Get current book
    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    if (books.length === 0) {
      return NextResponse.json(
        { error: 'Buku tidak ditemukan' },
        { status: 404 }
      );
    }

    const currentBook = books[0];
    const newStock = stock || currentBook.stock;
    const stockDifference = newStock - currentBook.stock;
    const newAvailable = Math.max(0, currentBook.available + stockDifference);

    await pool.execute(
      `UPDATE books 
       SET title = ?, author = ?, isbn = ?, genre = ?, description = ?, 
           image_url = ?, stock = ?, available = ?, published_year = ?, publisher = ?
       WHERE id = ?`,
      [
        title,
        author,
        isbn || null,
        genre,
        description || null,
        image_url || null,
        newStock,
        newAvailable,
        published_year || null,
        publisher || null,
        id
      ]
    );

    const [updatedBook] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      book: updatedBook[0],
      message: 'Buku berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await pool.execute('DELETE FROM books WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Buku berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

