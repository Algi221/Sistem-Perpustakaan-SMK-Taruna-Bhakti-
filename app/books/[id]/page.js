import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import BorrowButton from './components/BorrowButton';
import BookDetailInfo from './components/BookDetailInfo';
import BorrowingCalendar from './components/BorrowingCalendar';
import BookActionButtons from './components/BookActionButtons';
import BookDescription from './components/BookDescription';
import BookReviews from './components/BookReviews';
import RecommendedBooks from './components/RecommendedBooks';
import BackButton from './components/BackButton';

async function getBook(id) {
  try {
    // Get book details
    const [books] = await pool.execute(
      'SELECT * FROM books WHERE id = ?',
      [id]
    );
    
    if (books.length === 0) return null;
    
    const book = books[0];
    
    // Count active borrowings (status = 'borrowed')
    const [borrowings] = await pool.execute(
      `SELECT COUNT(*) as count FROM borrowings 
       WHERE book_id = ? AND status = 'borrowed'`,
      [id]
    );
    
    const borrowedCount = borrowings[0]?.count || 0;
    // Calculate available: stock - borrowed_count
    book.available = Math.max(0, book.stock - borrowedCount);
    
    return book;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

async function getUserBorrowing(bookId, userId) {
  if (!userId) return null;
  
  try {
    const [borrowings] = await pool.execute(
      `SELECT * FROM borrowings 
       WHERE book_id = ? AND user_id = ? 
       AND status IN ('pending', 'approved', 'borrowed')
       ORDER BY created_at DESC
       LIMIT 1`,
      [bookId, userId]
    );
    
    return borrowings.length > 0 ? borrowings[0] : null;
  } catch (error) {
    console.error('Error fetching user borrowing:', error);
    return null;
  }
}

export default async function BookDetailPage({ params }) {
  // Next.js 16: params sekarang adalah Promise, harus di-await
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  const session = await getSession();
  let userBorrowing = null;
  
  if (session?.user?.id) {
    try {
      userBorrowing = await getUserBorrowing(book.id, session.user.id);
    } catch (error) {
      console.error('Error fetching user borrowing:', error);
      userBorrowing = null;
    }
  }

  const availabilityPercentage = book.stock > 0 ? (book.available / book.stock) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <BackButton />
          
          {/* Main Book Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-300">
            <div className="md:flex">
              <BookDetailInfo book={book} availabilityPercentage={availabilityPercentage} />
            </div>
            
            {/* Action Buttons Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 md:px-8 lg:px-10 py-6 transition-colors duration-300">
              <BookActionButtons bookId={book.id} book={book} available={book.available} userBorrowing={userBorrowing || null} />
            </div>
          </div>

          {/* Calendar Section - Compact */}
          <div className="mb-6 max-w-md">
            <BorrowingCalendar bookId={book.id} />
          </div>

          {/* Description Section */}
          <BookDescription description={book.description} />

          {/* Reviews Section */}
          <BookReviews bookId={book.id} />

          {/* Recommended Books Section */}
          <RecommendedBooks currentBookId={book.id} currentGenre={book.genre} />
        </div>
      </div>
    </div>
  );
}

