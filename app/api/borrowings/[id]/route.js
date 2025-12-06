import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

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
    const body = await request.json();
    const { status } = body;

    // Staff hanya bisa approve, tidak bisa reject
    // Staff juga bisa confirm return untuk return_requested status
    if (!['approved', 'borrowed', 'returned', 'return_requested'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid. Staff hanya dapat menyetujui peminjaman.' },
        { status: 400 }
      );
    }

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

    // Update status peminjaman
    await pool.execute(
      `UPDATE borrowings 
       SET status = ?, staff_id = ?, updated_at = NOW() 
       WHERE id = ?`,
      [status, session.user.id || null, id]
    );

    // Jika approved, tidak kurangi stok (tunggu sampai buku diambil)
    // Stok akan berkurang saat status menjadi 'borrowed' (saat pickup)
    
    // Kalau returned, tambah available count
    if (status === 'returned') {
      // Stok akan bertambah saat buku dikembalikan
      // Set return date
      await pool.execute(
        'UPDATE borrowings SET return_date = CURDATE() WHERE id = ?',
        [id]
      );
    }


    return NextResponse.json({ message: 'Status berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating borrowing:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

