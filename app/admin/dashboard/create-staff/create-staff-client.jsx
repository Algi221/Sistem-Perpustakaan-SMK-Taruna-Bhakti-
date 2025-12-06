'use client';

import { useState } from 'react';
import { UserCog, Plus } from 'lucide-react';
import StaffForm from '@/components/staff/StaffForm';

export default function CreateStaffClient({ initialStaff }) {
  const [staff, setStaff] = useState(initialStaff);
  const [showStaffForm, setShowStaffForm] = useState(false);

  const handleStaffCreate = (newStaff) => {
    setStaff([newStaff, ...staff]);
    setShowStaffForm(false);
    // Refresh page to get latest data
    window.location.reload();
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Create Petugas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Tambah petugas baru</p>
        </div>
        <button
          onClick={() => setShowStaffForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Petugas</span>
        </button>
      </div>

      {/* Staff Form Modal */}
      {showStaffForm && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-100 dark:border-gray-700 transition-colors duration-300">
            <StaffForm
              onSave={handleStaffCreate}
              onCancel={() => setShowStaffForm(false)}
            />
          </div>
        </div>
      )}

      {staff.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-blue-100 dark:border-gray-700 transition-colors duration-300">
          <UserCog className="w-16 h-16 mb-4 text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Belum ada petugas terdaftar.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Klik tombol "Tambah Petugas" untuk menambahkan petugas pertama!</p>
          <button
            onClick={() => setShowStaffForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Tambah Petugas Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Telepon
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Tanggal Dibuat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {s.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {s.phone || <span className="text-gray-400 dark:text-gray-500">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {new Date(s.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

