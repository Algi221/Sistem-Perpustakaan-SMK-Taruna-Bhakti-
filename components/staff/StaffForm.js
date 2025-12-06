'use client';

import { useState } from 'react';

export default function StaffForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Terjadi kesalahan');
        return;
      }

      onSave(data.staff);
    } catch (err) {
      setError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl">👨‍💼</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Tambah Petugas Baru</h2>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 transition-colors duration-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            Nama Lengkap *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="nama@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            Password *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            No. Telepon
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Simpan</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

