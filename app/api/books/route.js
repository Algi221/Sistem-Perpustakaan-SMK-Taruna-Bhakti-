import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import { enrichBooksWithAvailableStock } from '@/lib/bookUtils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (genre) {
      query += ' AND genre = ?';
      params.push(genre);
    }

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [books] = await pool.execute(query, params);
    // Enrich books with calculated available stock
    const booksWithAvailable = await enrichBooksWithAvailableStock(books);
    return NextResponse.json(booksWithAvailable);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    if (!title || !author || !genre) {
      return NextResponse.json(
        { error: 'Judul, penulis, dan genre wajib diisi' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO books (title, author, isbn, genre, description, image_url, stock, available, published_year, publisher) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        author,
        isbn || null,
        genre,
        description || null,
        image_url || null,
        stock || 0,
        stock || 0, // available equals stock for new books
        published_year || null,
        publisher || null
      ]
    );

    const [newBook] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(
      { book: newBook[0], message: 'Buku berhasil ditambahkan' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

