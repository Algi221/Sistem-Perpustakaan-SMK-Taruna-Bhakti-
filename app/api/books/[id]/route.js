import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import { updateBookSchema, validationErrorResponse } from '@/lib/validations';

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
    
    // Validate request body dengan Zod
    const validationResult = updateBookSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        validationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

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
    const validatedData = validationResult.data;
    
    // Merge dengan data existing (hanya update field yang dikirim)
    const updateData = {
      title: validatedData.title ?? currentBook.title,
      author: validatedData.author ?? currentBook.author,
      isbn: validatedData.isbn !== undefined ? validatedData.isbn : currentBook.isbn,
      genre: validatedData.genre ?? currentBook.genre,
      description: validatedData.description !== undefined ? validatedData.description : currentBook.description,
      image_url: validatedData.image_url !== undefined ? validatedData.image_url : currentBook.image_url,
      stock: validatedData.stock !== undefined ? validatedData.stock : currentBook.stock,
      published_year: validatedData.published_year !== undefined ? validatedData.published_year : currentBook.published_year,
      publisher: validatedData.publisher !== undefined ? validatedData.publisher : currentBook.publisher,
    };

    const newStock = updateData.stock;
    const stockDifference = newStock - currentBook.stock;
    const newAvailable = Math.max(0, currentBook.available + stockDifference);

    await pool.execute(
      `UPDATE books 
       SET title = ?, author = ?, isbn = ?, genre = ?, description = ?, 
           image_url = ?, stock = ?, available = ?, published_year = ?, publisher = ?
       WHERE id = ?`,
      [
        updateData.title,
        updateData.author,
        updateData.isbn || null,
        updateData.genre,
        updateData.description || null,
        updateData.image_url || null,
        newStock,
        newAvailable,
        updateData.published_year || null,
        updateData.publisher || null,
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

