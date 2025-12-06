'use client';

import { useState } from 'react';

export default function ChangeEmailForm({ currentEmail, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    newEmail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newEmail === currentEmail) {
      setError('Email baru harus berbeda dengan email saat ini');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/profile/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: formData.newEmail,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengubah email');
      }

      setSuccess(true);
      setFormData({
        newEmail: '',
        password: '',
      });

      if (onSuccess) {
        await onSuccess();
      }

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error changing email:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span>📧</span>
        <span>Ubah Email</span>
      </h3>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-600 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
          Email berhasil diubah! Halaman akan dimuat ulang...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email Saat Ini
          </label>
          <input
            type="email"
            value={currentEmail}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email Baru
          </label>
          <input
            type="email"
            value={formData.newEmail}
            onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Konfirmasi Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gray-700 dark:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? 'Mengubah...' : 'Ubah Email'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

