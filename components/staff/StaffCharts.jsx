'use client';

import { BarChart3, TrendingUp, BookOpen, Users } from 'lucide-react';

export default function StaffCharts({ stats }) {
  const {
    totalBooks,
    totalBorrowings,
    pendingBorrowings,
    activeBorrowings,
    borrowingsByStatus,
    borrowingsByMonth,
    booksByGenre
  } = stats;

  // Prepare data for charts
  const statusData = borrowingsByStatus.reduce((acc, item) => {
    acc[item.status] = item.count;
    return acc;
  }, {});

  const monthLabels = borrowingsByMonth.map(item => {
    const date = new Date(item.month + '-01');
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  });
  const monthValues = borrowingsByMonth.map(item => item.count);

  const genreLabels = booksByGenre.map(item => item.genre);
  const genreValues = booksByGenre.map(item => item.count);

  // Calculate max values for scaling
  const maxMonthValue = Math.max(...monthValues, 1);
  const maxGenreValue = Math.max(...genreValues, 1);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          <span>Grafik & Statistik</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Analisis data peminjaman dan koleksi buku</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Buku</p>
              <p className="text-3xl font-bold">{totalBooks}</p>
            </div>
            <BookOpen className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm mb-1">Total Peminjaman</p>
              <p className="text-3xl font-bold">{totalBorrowings}</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Menunggu</p>
              <p className="text-3xl font-bold">{pendingBorrowings}</p>
            </div>
            <div className="text-4xl opacity-80">⏳</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Aktif</p>
              <p className="text-3xl font-bold">{activeBorrowings}</p>
            </div>
            <Users className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Distribusi Status Peminjaman</h3>
          <div className="flex items-center justify-center h-64">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {borrowingsByStatus.length > 0 ? (
                (() => {
                  let currentAngle = -90;
                  const total = borrowingsByStatus.reduce((sum, item) => sum + item.count, 0);
                  const colors = {
                    'pending': '#eab308',
                    'approved': '#3b82f6',
                    'borrowed': '#10b981',
                    'returned': '#6b7280',
                    'rejected': '#ef4444'
                  };
                  const labels = {
                    'pending': 'Menunggu',
                    'approved': 'Disetujui',
                    'borrowed': 'Dipinjam',
                    'returned': 'Dikembalikan',
                    'rejected': 'Ditolak'
                  };

                  return borrowingsByStatus.map((item, index) => {
                    const percentage = (item.count / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const largeArc = percentage > 50 ? 1 : 0;
                    
                    const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                    const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                    const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                    const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                    
                    const pathData = [
                      `M 100 100`,
                      `L ${x1} ${y1}`,
                      `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                      `Z`
                    ].join(' ');

                    const labelAngle = currentAngle + angle / 2;
                    const labelX = 100 + 50 * Math.cos((labelAngle * Math.PI) / 180);
                    const labelY = 100 + 50 * Math.sin((labelAngle * Math.PI) / 180);

                    const result = (
                      <g key={item.status}>
                        <path
                          d={pathData}
                          fill={colors[item.status] || '#6b7280'}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs font-semibold fill-white"
                        >
                          {percentage > 5 ? `${Math.round(percentage)}%` : ''}
                        </text>
                      </g>
                    );

                    currentAngle += angle;
                    return result;
                  });
                })()
              ) : (
                <text x="100" y="100" textAnchor="middle" className="text-gray-400 dark:text-gray-500">
                  Tidak ada data
                </text>
              )}
            </svg>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {borrowingsByStatus.map((item) => {
              const colors = {
                'pending': 'bg-yellow-500',
                'approved': 'bg-blue-500',
                'borrowed': 'bg-green-500',
                'returned': 'bg-gray-500',
                'rejected': 'bg-red-500'
              };
              const labels = {
                'pending': 'Menunggu',
                'approved': 'Disetujui',
                'borrowed': 'Dipinjam',
                'returned': 'Dikembalikan',
                'rejected': 'Ditolak'
              };
              return (
                <div key={item.status} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${colors[item.status] || 'bg-gray-500'}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {labels[item.status] || item.status}: {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Borrowings Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Peminjaman per Bulan (6 Bulan Terakhir)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthValues.length > 0 ? (
              monthValues.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${(value / maxMonthValue) * 100}%` }}
                      title={`${value} peminjaman`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                    {monthLabels[index]}
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                Tidak ada data
              </div>
            )}
          </div>
        </div>

        {/* Books by Genre Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Buku per Genre (Top 10)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {genreValues.length > 0 ? (
              genreValues.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${(value / maxGenreValue) * 100}%` }}
                      title={`${value} buku`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium px-1" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    {genreLabels[index]}
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                Tidak ada data
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

