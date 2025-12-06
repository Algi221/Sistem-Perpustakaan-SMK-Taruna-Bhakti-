'use client';

import { useState } from 'react';
import BookCard from '@/components/books/BookCard';
import BorrowingRequestCard from '@/components/borrowings/BorrowingRequestCard';
import StaffCalendar from '@/components/staff/StaffCalendar';
import BookForm from '@/components/books/BookForm';

export default function StaffDashboard({ books: initialBooks, borrowings: initialBorrowings }) {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState(initialBooks);
  const [borrowings, setBorrowings] = useState(initialBorrowings);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const handleBookUpdate = (updatedBook) => {
    if (editingBook) {
      setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
      setEditingBook(null);
    } else {
      setBooks([updatedBook, ...books]);
    }
    setShowBookForm(false);
  };

  const handleBookDelete = async (bookId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBooks(books.filter(b => b.id !== bookId));
      } else {
        alert('Gagal menghapus buku');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  };

  const handleBorrowingUpdate = (updatedBorrowing) => {
    setBorrowings(borrowings.map(b => 
      b.id === updatedBorrowing.id ? updatedBorrowing : b
    ));
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  const pendingBorrowings = borrowings.filter(b => b.status === 'pending');
  const activeBorrowings = borrowings.filter(b => 
    b.status === 'approved' || b.status === 'borrowed'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <span className="text-4xl">👨‍💼</span>
              <span>Dashboard Petugas</span>
            </h1>
            <p className="text-gray-600">Kelola buku dan permintaan peminjaman</p>
          </div>
          <button
            onClick={() => {
              setEditingBook(null);
              setShowBookForm(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
          >
            <span>➕</span>
            <span>Tambah Buku</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Buku</p>
                <p className="text-3xl font-bold">{books.length}</p>
              </div>
              <div className="text-4xl opacity-80">📚</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Permintaan Pending</p>
                <p className="text-3xl font-bold">{pendingBorrowings.length}</p>
              </div>
              <div className="text-4xl opacity-80">⏳</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Peminjaman Aktif</p>
                <p className="text-3xl font-bold">{activeBorrowings.length}</p>
              </div>
              <div className="text-4xl opacity-80">📖</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 flex gap-2 border border-gray-100">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'books'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📚 Kelola Buku
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all relative ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⏳ Permintaan
            {pendingBorrowings.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {pendingBorrowings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📖 Peminjaman Aktif
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📅 Kalender
          </button>
        </div>

        {/* Book Form Modal */}
        {showBookForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <BookForm
                book={editingBook}
                onSave={handleBookUpdate}
                onCancel={() => {
                  setShowBookForm(false);
                  setEditingBook(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'books' && (
          <div>
            {books.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg mb-2">Belum ada buku.</p>
                <p className="text-gray-400 text-sm">Klik tombol "Tambah Buku" untuk menambahkan buku pertama!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books.map((book) => (
                  <div key={book.id} className="relative group">
                    <BookCard book={book} />
                    <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditBook(book)}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleBookDelete(book.id)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingBorrowings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-gray-500 text-lg">Tidak ada permintaan peminjaman.</p>
                <p className="text-gray-400 text-sm">Semua permintaan telah diproses!</p>
              </div>
            ) : (
              pendingBorrowings.map((borrowing) => (
                <BorrowingRequestCard
                  key={borrowing.id}
                  borrowing={borrowing}
                  onUpdate={handleBorrowingUpdate}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeBorrowings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-gray-500 text-lg">Tidak ada peminjaman aktif.</p>
                <p className="text-gray-400 text-sm">Semua buku telah dikembalikan!</p>
              </div>
            ) : (
              activeBorrowings.map((borrowing) => (
                <BorrowingRequestCard
                  key={borrowing.id}
                  borrowing={borrowing}
                  onUpdate={handleBorrowingUpdate}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <StaffCalendar borrowings={borrowings} />
          </div>
        )}
      </div>
    </div>
  );
}

