import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import { calculateBorrowingFine } from '@/lib/fineCalculator';

// PATCH - Petugas konfirmasi pengembalian (ubah status jadi 'returned')
export async function PATCH(request, { params }) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Ambil detail peminjaman
    const [borrowings] = await pool.execute(
      'SELECT * FROM borrowings WHERE id = ?',
      [id]
    );

    if (borrowings.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    const borrowing = borrowings[0];

    // Hanya boleh konfirmasi kalau statusnya 'return_requested'
    if (borrowing.status !== 'return_requested') {
      return NextResponse.json(
        { error: 'Status peminjaman tidak valid untuk konfirmasi pengembalian' },
        { status: 400 }
      );
    }

    // Update status jadi 'returned' dan set return_date
    const returnDate = new Date().toISOString().split('T')[0];
    
    // Hitung denda kalau terlambat
    const fineCalculation = calculateBorrowingFine(borrowing.due_date, returnDate);
    
    await pool.execute(
      `UPDATE borrowings 
       SET status = 'returned', 
           return_date = ?,
           staff_id = ?,
           fine_amount = ?,
           fine_days = ?,
           updated_at = NOW() 
       WHERE id = ?`,
      [returnDate, session.user.id, fineCalculation.fineAmount, fineCalculation.lateDays, id]
    );

    // Ambil info buku
    const [bookInfo] = await pool.execute(
      'SELECT title FROM books WHERE id = ?',
      [borrowing.book_id]
    );
    const bookTitle = bookInfo[0]?.title || 'Buku';

    return NextResponse.json({
      message: 'Pengembalian buku telah dikonfirmasi',
      bookTitle
    });
  } catch (error) {
    console.error('Error confirming return:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

