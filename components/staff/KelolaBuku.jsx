'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import BookForm from '@/components/books/BookForm';

export default function KelolaBuku({ initialBooks }) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookUpdate = async (updatedBook) => {
    if (editingBook) {
      setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
      setEditingBook(null);
    } else {
      setBooks([updatedBook, ...books]);
    }
    setShowBookForm(false);
    router.refresh();
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

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowBookForm(true);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Kelola Buku
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola koleksi buku perpustakaan</p>
        </div>
        <button
          onClick={() => {
            setEditingBook(null);
            setShowBookForm(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Buku</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Buku</p>
              <p className="text-3xl font-bold">{books.length}</p>
            </div>
            <div className="text-4xl opacity-80">📚</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Tersedia</p>
              <p className="text-3xl font-bold">
                {books.reduce((sum, book) => sum + (book.available || 0), 0)}
              </p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Dipinjam</p>
              <p className="text-3xl font-bold">
                {books.reduce((sum, book) => sum + ((book.stock || 0) - (book.available || 0)), 0)}
              </p>
            </div>
            <div className="text-4xl opacity-80">📖</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Stok</p>
              <p className="text-3xl font-bold">
                {books.reduce((sum, book) => sum + (book.stock || 0), 0)}
              </p>
            </div>
            <div className="text-4xl opacity-80">📊</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari buku berdasarkan judul, penulis, atau genre..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Book Form Modal */}
      {showBookForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
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

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detail Buku</h2>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                {selectedBook.image_url ? (
                  <Image
                    src={selectedBook.image_url}
                    alt={selectedBook.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">📚</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedBook.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">oleh {selectedBook.author}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Genre:</span> <span className="text-gray-600 dark:text-gray-400">{selectedBook.genre}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">ISBN:</span> <span className="text-gray-600 dark:text-gray-400">{selectedBook.isbn || '-'}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Penerbit:</span> <span className="text-gray-600 dark:text-gray-400">{selectedBook.publisher || '-'}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Tahun:</span> <span className="text-gray-600 dark:text-gray-400">{selectedBook.published_year || '-'}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Stok:</span> <span className="text-gray-600 dark:text-gray-400">{selectedBook.stock}</span></p>
                  <p><span className="font-semibold text-gray-700 dark:text-gray-300">Tersedia:</span> <span className="text-gray-600 dark:text-gray-400">{selectedBook.available}</span></p>
                </div>
                {selectedBook.description && (
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Deskripsi:</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedBook.description}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      setSelectedBook(null);
                      handleEditBook(selectedBook);
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <Link
                    href={`/books/${selectedBook.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            {searchQuery ? 'Tidak ada buku yang ditemukan' : 'Belum ada buku'}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {searchQuery ? 'Coba cari dengan kata kunci lain' : 'Klik tombol "Tambah Buku" untuk menambahkan buku pertama!'}
          </p>
        </div>
      ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
           {filteredBooks.map((book) => (
             <div
               key={book.id}
               className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col"
               onClick={() => setSelectedBook(book)}
             >
               <div className="relative w-full aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center p-3">
                 {book.image_url ? (
                   <Image
                     src={book.image_url}
                     alt={book.title}
                     fill
                     className="object-contain group-hover:scale-105 transition-transform duration-300"
                     unoptimized
                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center">
                     <span className="text-6xl">📚</span>
                   </div>
                 )}
                 <div className="absolute top-3 right-3 z-10">
                   <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                     book.available > 0 
                       ? 'bg-green-500 text-white' 
                       : 'bg-red-500 text-white'
                   }`}>
                     {book.available > 0 ? 'Tersedia' : 'Habis'}
                   </span>
                 </div>
               </div>
              
               <div className="p-3 flex-1 flex flex-col">
                 <h3 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                   {book.title}
                 </h3>
                 <p className="text-gray-600 dark:text-gray-400 text-[10px] mb-2 leading-tight">oleh {book.author}</p>
                 <div className="flex items-center justify-between mb-2 gap-2">
                   <span className="inline-block bg-blue-500 dark:bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-semibold truncate">
                     {book.genre}
                   </span>
                   {book.published_year && (
                     <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                       {book.published_year}
                     </span>
                   )}
                 </div>
                 <div className="flex items-center justify-between text-[10px] mb-2 mt-auto">
                   <span className="text-gray-600 dark:text-gray-400">Stok</span>
                   <span className="text-gray-800 dark:text-gray-200 font-semibold">
                     {book.available} / {book.stock}
                   </span>
                 </div>
                 <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       handleEditBook(book);
                     }}
                     className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-2 py-1.5 rounded-lg text-[10px] font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center justify-center gap-1"
                   >
                     <Edit className="w-3 h-3" />
                     Edit
                   </button>
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       handleBookDelete(book.id);
                     }}
                     className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1.5 rounded-lg text-[10px] font-semibold hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-1"
                   >
                     <Trash2 className="w-3 h-3" />
                     Hapus
                   </button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

