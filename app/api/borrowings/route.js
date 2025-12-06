import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If bookId is provided, get borrowings for that specific book
    if (bookId) {
      const [borrowings] = await pool.execute(
        `SELECT b.*, u.name as user_name, u.email as user_email, 
         bk.title, bk.author, s.name as staff_name
         FROM borrowings b
         JOIN users u ON b.user_id = u.id
         LEFT JOIN books bk ON b.book_id = bk.id
         LEFT JOIN staff s ON b.staff_id = s.id
         WHERE b.book_id = ?
         ORDER BY b.created_at DESC`,
        [bookId]
      );
      return NextResponse.json(borrowings);
    }

    // Staff and admin can see all borrowings
    if (session.user.role === 'staff' || session.user.role === 'admin') {
      const [borrowings] = await pool.execute(
        `SELECT b.*, u.name as user_name, u.email as user_email, 
         bk.title, bk.author, s.name as staff_name
         FROM borrowings b
         JOIN users u ON b.user_id = u.id
         LEFT JOIN books bk ON b.book_id = bk.id
         LEFT JOIN staff s ON b.staff_id = s.id
         ORDER BY b.created_at DESC`
      );
      return NextResponse.json(borrowings);
    }

    // Users can only see their own borrowings
    const [borrowings] = await pool.execute(
      `SELECT b.*, bk.title, bk.author 
       FROM borrowings b
       JOIN books bk ON b.book_id = bk.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(borrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

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
    const { bookId, durationDays } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID diperlukan' },
        { status: 400 }
      );
    }

    // Validasi durasi pinjam: minimal 14 hari (2 minggu), maksimal 30 hari (1 bulan)
    const days = parseInt(durationDays) || 14;
    if (days < 14 || days > 30) {
      return NextResponse.json(
        { error: 'Durasi pinjam harus antara 14 hari (2 minggu) sampai 30 hari (1 bulan)' },
        { status: 400 }
      );
    }

    // Check if book exists and is available
    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [bookId]
    );

    if (books.length === 0) {
      return NextResponse.json(
        { error: 'Buku tidak ditemukan' },
        { status: 404 }
      );
    }

    const book = books[0];

    // Check if book is currently borrowed by any user (status = 'borrowed')
    const [activeBorrowings] = await pool.execute(
      `SELECT COUNT(*) as count FROM borrowings 
       WHERE book_id = ? AND status = 'borrowed'`,
      [bookId]
    );

    const borrowedCount = activeBorrowings[0]?.count || 0;
    const availableCount = book.stock - borrowedCount;

    if (availableCount <= 0) {
      return NextResponse.json(
        { error: 'Buku sedang dipinjam dan tidak tersedia saat ini' },
        { status: 400 }
      );
    }

    // Check if user already has a pending/borrowed request for this book
    const [existing] = await pool.execute(
      `SELECT * FROM borrowings 
       WHERE user_id = ? AND book_id = ? 
       AND status IN ('pending', 'approved', 'borrowed')`,
      [session.user.id, bookId]
    );

    if (existing.length > 0) {
      const existingBorrowing = existing[0];
      let errorMessage = 'Anda sudah meminjam buku ini';
      
      if (existingBorrowing.status === 'pending') {
        errorMessage = 'Permintaan peminjaman Anda masih menunggu persetujuan. Silakan tunggu konfirmasi dari staff.';
      } else if (existingBorrowing.status === 'approved') {
        errorMessage = 'Buku sudah disetujui dan siap diambil. Silakan konfirmasi pengambilan buku terlebih dahulu.';
      } else if (existingBorrowing.status === 'borrowed') {
        errorMessage = 'Buku sedang Anda pinjam. Silakan kembalikan buku terlebih dahulu sebelum meminjam lagi.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Calculate due date berdasarkan durasi yang dipilih
    // Untuk status 'pending', borrow_date akan di-set saat buku di-approve dan diambil
    // Tapi karena schema mengharuskan NOT NULL, kita set ke CURDATE() sebagai placeholder
    // borrow_date yang sebenarnya akan di-update saat status menjadi 'borrowed'
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    // Create borrowing request
    // Note: borrow_date di-set ke CURDATE() untuk memenuhi constraint NOT NULL
    // Tapi ini hanya placeholder, tanggal sebenarnya akan di-update saat pickup
    await pool.execute(
      `INSERT INTO borrowings (user_id, book_id, borrow_date, due_date, status) 
       VALUES (?, ?, CURDATE(), ?, 'pending')`,
      [session.user.id, bookId, dueDate]
    );

    return NextResponse.json(
      { message: 'Permintaan peminjaman berhasil dibuat' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating borrowing:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

