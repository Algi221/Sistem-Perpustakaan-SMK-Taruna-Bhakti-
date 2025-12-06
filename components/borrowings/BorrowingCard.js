'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function BorrowingCard({ borrowing }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800',
          icon: '⏳',
          label: 'Menunggu Persetujuan'
        };
      case 'approved':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800',
          icon: '✅',
          label: 'Disetujui'
        };
      case 'borrowed':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800',
          icon: '📖',
          label: 'Dipinjam'
        };
      case 'returned':
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800',
          icon: '📚',
          label: 'Dikembalikan'
        };
      case 'rejected':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800',
          icon: '❌',
          label: 'Ditolak'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800',
          icon: '📄',
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(borrowing.status);
  const isOverdue = borrowing.due_date && new Date(borrowing.due_date) < new Date() && borrowing.status === 'borrowed';

  return (
    <Link href={`/books/${borrowing.book_id}`}>
      <div className={`group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${statusConfig.bg}`}>
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={borrowing.image_url || 'https://via.placeholder.com/400x600?text=No+Image'}
            alt={borrowing.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            unoptimized
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
            }}
          />
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 ${statusConfig.badge}`}>
              <span>{statusConfig.icon}</span>
              <span>{statusConfig.label}</span>
            </span>
          </div>
          {isOverdue && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg animate-pulse">
                ⚠️ Terlambat
              </span>
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors">
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
                <span className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
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
                <span className="font-semibold text-gray-800">
                  {new Date(borrowing.return_date).toLocaleDateString('id-ID')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

