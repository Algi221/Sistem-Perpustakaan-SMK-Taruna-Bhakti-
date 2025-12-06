'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function BorrowingHistory({ borrowings }) {
  if (borrowings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-gray-500 text-lg mb-2">Belum ada history peminjaman</p>
        <p className="text-gray-400 text-sm">Buku yang sudah dikembalikan akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>📚</span>
          <span>History Peminjaman</span>
        </h2>
        <span className="text-gray-600 font-semibold">
          Total: {borrowings.length} buku
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {borrowings.map((borrowing) => (
          <Link
            key={borrowing.id}
            href={`/books/${borrowing.book_id}`}
            className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200"
          >
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
              <Image
                src={borrowing.image_url || 'https://via.placeholder.com/400x600?text=No+Image'}
                alt={borrowing.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                unoptimized
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1.5 bg-gray-700 text-white rounded-full text-xs font-bold shadow-lg">
                  ✅ Dikembalikan
                </span>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {borrowing.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 flex items-center gap-1">
                <span className="text-gray-400">oleh</span>
                <span className="font-medium">{borrowing.author}</span>
              </p>
              
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <span>📅</span>
                    <span>Pinjam:</span>
                  </span>
                  <span className="font-semibold text-gray-800">
                    {new Date(borrowing.borrow_date).toLocaleDateString('id-ID')}
                  </span>
                </div>
                {borrowing.due_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>⏰</span>
                      <span>Jatuh Tempo:</span>
                    </span>
                    <span className="font-semibold text-gray-800">
                      {new Date(borrowing.due_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                )}
                {borrowing.return_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <span>↩️</span>
                      <span>Kembali:</span>
                    </span>
                    <span className="font-semibold text-blue-600">
                      {new Date(borrowing.return_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

