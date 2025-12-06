import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();

    if (!session || (session.user.role !== 'siswa' && session.user.role !== 'umum')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get borrowing details
    const [borrowings] = await pool.execute(
      'SELECT * FROM borrowings WHERE id = ? AND user_id = ?',
      [id, session.user.id]
    );

    if (borrowings.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman tidak ditemukan' },
        { status: 404 }
      );
    }

    const borrowing = borrowings[0];

    // Hanya bisa pickup jika status approved
    if (borrowing.status !== 'approved') {
      return NextResponse.json(
        { error: 'Buku belum disetujui untuk diambil' },
        { status: 400 }
      );
    }

    // Update status menjadi borrowed dan set borrow_date ke hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Recalculate due_date berdasarkan durasi yang sudah ditetapkan
    // Ambil durasi dari selisih due_date original dengan borrow_date original (placeholder)
    const originalBorrowDate = borrowing.borrow_date ? new Date(borrowing.borrow_date) : new Date(borrowing.created_at);
    originalBorrowDate.setHours(0, 0, 0, 0);
    const originalDueDate = new Date(borrowing.due_date);
    originalDueDate.setHours(0, 0, 0, 0);
    
    // Hitung durasi yang dipilih user (dalam hari)
    const daysDiff = Math.ceil((originalDueDate - originalBorrowDate) / (1000 * 60 * 60 * 24));
    
    // Set due_date baru berdasarkan hari ini + durasi yang dipilih
    const newDueDate = new Date(today);
    newDueDate.setDate(newDueDate.getDate() + daysDiff);

    // Update status menjadi borrowed, borrow_date ke hari ini, dan recalculate due_date
    await pool.execute(
      `UPDATE borrowings 
       SET status = 'borrowed', borrow_date = ?, due_date = ?, updated_at = NOW() 
       WHERE id = ?`,
      [today, newDueDate, id]
    );

    // Stok otomatis berkurang karena kita menghitung dari COUNT(borrowings WHERE status='borrowed')
    // Tidak perlu update kolom available

    // Get book title and user info for notification
    const [bookInfo] = await pool.execute(
      'SELECT title FROM books WHERE id = ?',
      [borrowing.book_id]
    );
    const bookTitle = bookInfo[0]?.title || 'Buku';

    // Get user info
    const [userInfo] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [borrowing.user_id]
    );
    const userName = userInfo[0]?.name || 'User';

    // Create notification for staff/admin about pickup confirmation
    // Try to create message notification if messages table exists
    try {
      // Get all staff IDs
      const [staffList] = await pool.execute('SELECT id FROM staff');
      
      // Get all admin IDs
      const [adminList] = await pool.execute('SELECT id FROM admin');
      
      // Combine all staff and admin IDs
      const allStaffAdmins = [...staffList, ...adminList];

      for (const staffAdmin of allStaffAdmins) {
        // Determine role based on which table the ID came from
        const receiverRole = staffList.some(s => s.id === staffAdmin.id) ? 'staff' : 'admin';
        
        await pool.execute(
          `INSERT INTO messages (borrowing_id, sender_id, sender_role, receiver_id, receiver_role, message, type, is_read)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            borrowing.user_id,
            'user',
            staffAdmin.id,
            receiverRole,
            `User "${userName}" telah mengkonfirmasi bahwa buku "${bookTitle}" sudah diambil. Status peminjaman sekarang: Dipinjam.`,
            'info',
            false
          ]
        );
      }
    } catch (error) {
      // Messages table might not exist, skip notification
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error creating pickup notification:', error);
      }
    }

    return NextResponse.json({ 
      message: 'Buku telah ditandai sebagai diambil. Durasi peminjaman dimulai dari hari ini.',
      bookTitle: bookTitle
    });
  } catch (error) {
    console.error('Error updating pickup:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}

