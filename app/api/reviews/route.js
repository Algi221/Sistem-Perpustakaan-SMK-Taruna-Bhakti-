import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

// GET reviews for a book
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json(
        { error: 'bookId is required' },
        { status: 400 }
      );
    }

    // Get all reviews for this book (including fake reviews)
    // Use LEFT JOIN to ensure reviews appear even if user doesn't exist
    const [reviews] = await pool.execute(
      `SELECT r.*, 
              COALESCE(u.name, 'Pengguna') as user_name, 
              COALESCE(u.email, '') as user_email
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.book_id = ?
       ORDER BY r.created_at DESC`,
      [bookId]
    );

    // Calculate rating statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingBreakdown = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return NextResponse.json({
      reviews,
      statistics: {
        average: averageRating,
        total: totalReviews,
        breakdown: ratingBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

// POST create a new review
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
    const { bookId, borrowingId, rating, review } = body;

    // Validation
    if (!bookId || !borrowingId || !rating) {
      return NextResponse.json(
        { error: 'bookId, borrowingId, dan rating wajib diisi' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating harus antara 1-5' },
        { status: 400 }
      );
    }

    // Check if borrowing exists and user owns it
    const [borrowings] = await pool.execute(
      `SELECT * FROM borrowings 
       WHERE id = ? AND user_id = ? AND book_id = ?`,
      [borrowingId, session.user.id, bookId]
    );

    if (borrowings.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan atau tidak valid' },
        { status: 404 }
      );
    }

    const borrowing = borrowings[0];

    // Check if book has been returned
    if (borrowing.status !== 'returned') {
      return NextResponse.json(
        { error: 'Buku harus dikembalikan terlebih dahulu sebelum memberikan ulasan' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this borrowing
    const [existingReviews] = await pool.execute(
      `SELECT * FROM reviews 
       WHERE user_id = ? AND book_id = ? AND borrowing_id = ?`,
      [session.user.id, bookId, borrowingId]
    );

    if (existingReviews.length > 0) {
      return NextResponse.json(
        { error: 'Anda sudah memberikan ulasan untuk peminjaman ini' },
        { status: 400 }
      );
    }

    // Create review
    await pool.execute(
      `INSERT INTO reviews (book_id, user_id, borrowing_id, rating, review)
       VALUES (?, ?, ?, ?, ?)`,
      [bookId, session.user.id, borrowingId, rating, review || null]
    );

    return NextResponse.json({
      message: 'Ulasan berhasil ditambahkan'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    
    // Check for duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Anda sudah memberikan ulasan untuk buku ini' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}


