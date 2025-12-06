import pool from './db';

/**
 * Hitung stok tersedia untuk buku berdasarkan peminjaman aktif
 * @param {number} bookId - ID buku
 * @returns {Promise<number>} Jumlah tersedia
 */
export async function calculateAvailableStock(bookId) {
  try {
    // Ambil stok buku
    const [books] = await pool.execute(
      'SELECT stock FROM books WHERE id = ?',
      [bookId]
    );
    
    if (books.length === 0) return 0;
    
    const stock = books[0].stock || 0;
    
    // Hitung peminjaman aktif (status = 'borrowed')
    const [borrowings] = await pool.execute(
      `SELECT COUNT(*) as count FROM borrowings 
       WHERE book_id = ? AND status = 'borrowed'`,
      [bookId]
    );
    
    const borrowedCount = borrowings[0]?.count || 0;
    return Math.max(0, stock - borrowedCount);
  } catch (error) {
    console.error('Error calculating available stock:', error);
    return 0;
  }
}

/**
 * Hitung stok tersedia untuk beberapa buku
 * @param {Array<number>} bookIds - Array ID buku
 * @returns {Promise<Object>} Object dengan bookId sebagai key dan jumlah tersedia sebagai value
 */
export async function calculateAvailableStockForBooks(bookIds) {
  if (bookIds.length === 0) return {};
  
  try {
    const placeholders = bookIds.map(() => '?').join(',');
    
    // Ambil semua stok buku
    const [books] = await pool.execute(
      `SELECT id, stock FROM books WHERE id IN (${placeholders})`,
      bookIds
    );
    
    // Ambil semua peminjaman aktif untuk buku-buku ini
    const [borrowings] = await pool.execute(
      `SELECT book_id, COUNT(*) as count 
       FROM borrowings 
       WHERE book_id IN (${placeholders}) AND status = 'borrowed'
       GROUP BY book_id`,
      bookIds
    );
    
    // Buat map jumlah yang dipinjam
    const borrowedMap = {};
    borrowings.forEach(b => {
      borrowedMap[b.book_id] = b.count || 0;
    });
    
    // Hitung tersedia untuk setiap buku
    const result = {};
    books.forEach(book => {
      const borrowedCount = borrowedMap[book.id] || 0;
      result[book.id] = Math.max(0, (book.stock || 0) - borrowedCount);
    });
    
    return result;
  } catch (error) {
    console.error('Error calculating available stock for books:', error);
    return {};
  }
}

/**
 * Enrich books array with calculated available stock
 * @param {Array} books - Array of book objects
 * @returns {Promise<Array>} Books array with updated available property
 */
export async function enrichBooksWithAvailableStock(books) {
  if (books.length === 0) return books;
  
  try {
    const bookIds = books.map(b => b.id);
    const availableMap = await calculateAvailableStockForBooks(bookIds);
    
    return books.map(book => ({
      ...book,
      available: availableMap[book.id] !== undefined 
        ? availableMap[book.id] 
        : (book.available || 0)
    }));
  } catch (error) {
    console.error('Error enriching books with available stock:', error);
    return books;
  }
}

