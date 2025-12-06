'use client';

import { useMemo } from 'react';

export default function AdminCharts({ staff, users }) {
  // Calculate statistics
  const stats = useMemo(() => {
    const siswaCount = users.filter(u => u.role === 'siswa').length;
    const umumCount = users.filter(u => u.role === 'umum').length;
    const totalUsers = users.length;
    
    // Group by month for registration
    const userRegistrations = users.reduce((acc, user) => {
      const date = new Date(user.created_at);
      const month = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    
    const staffRegistrations = staff.reduce((acc, s) => {
      const date = new Date(s.created_at);
      const month = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    
    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }));
    }
    
    return {
      siswaCount,
      umumCount,
      totalUsers,
      userRegistrations,
      staffRegistrations,
      months
    };
  }, [staff, users]);

  // Calculate percentages for pie chart
  const siswaPercentage = stats.totalUsers > 0 ? (stats.siswaCount / stats.totalUsers) * 100 : 0;
  const umumPercentage = stats.totalUsers > 0 ? (stats.umumCount / stats.totalUsers) * 100 : 0;

  // Calculate max value for bar chart
  const maxUserValue = Math.max(...stats.months.map(m => stats.userRegistrations[m] || 0), 1);
  const maxStaffValue = Math.max(...stats.months.map(m => stats.staffRegistrations[m] || 0), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Distribution Pie Chart */}
      <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3 transition-colors duration-300">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">📊</span>
            </div>
            <span>Distribusi User</span>
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="relative w-32 h-32 mx-auto">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <defs>
                  <linearGradient id="gradientSiswa" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="gradientUmum" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  className="dark:stroke-gray-700"
                  strokeWidth="20"
                />
                {/* Siswa segment */}
                {siswaPercentage > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gradientSiswa)"
                    strokeWidth="20"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - siswaPercentage / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                )}
                {/* Umum segment - starts after siswa */}
                {umumPercentage > 0 && (
                  <g transform={`rotate(${siswaPercentage * 3.6} 50 50)`}>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="url(#gradientUmum)"
                      strokeWidth="20"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - umumPercentage / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </g>
                )}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800 dark:text-white">{stats.totalUsers}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Siswa</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{stats.siswaCount}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({siswaPercentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Umum</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{stats.umumCount}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({umumPercentage.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Growth Chart */}
      <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3 transition-colors duration-300">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">📈</span>
            </div>
            <span>Pertumbuhan Registrasi (6 Bulan)</span>
          </h3>
        </div>
        <div className="space-y-2">
          {stats.months.map((month, index) => {
            const userCount = stats.userRegistrations[month] || 0;
            const staffCount = stats.staffRegistrations[month] || 0;
            const userHeight = (userCount / maxUserValue) * 100;
            const staffHeight = (staffCount / maxStaffValue) * 100;
            
            return (
              <div key={month} className="flex items-end gap-1.5">
                <div className="flex-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 text-center">{month}</div>
                  <div className="flex items-end gap-1 h-20">
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-700"
                        style={{ height: `${userHeight}%` }}
                        title={`${userCount} User`}
                      >
                        {userCount > 0 && (
                          <div className="text-white text-xs font-bold text-center py-1">
                            {userCount}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">User</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-t-lg transition-all duration-500 hover:from-indigo-600 hover:to-indigo-700"
                        style={{ height: `${staffHeight}%` }}
                        title={`${staffCount} Staff`}
                      >
                        {staffCount > 0 && (
                          <div className="text-white text-xs font-bold text-center py-1">
                            {staffCount}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">Staff</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">User</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Staff</span>
          </div>
        </div>
      </div>
    </div>
  );
}

