'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Mail, CheckCircle, XCircle, Clock, User, Shield, Users,
  Loader2
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ResetPasswordRequestsClient({ initialRequests, dbError }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState({});

  const refreshRequests = async () => {
    try {
      // Fetch semua requests (pending dan approved) untuk menampilkan history
      const response = await fetch('/api/admin/password-reset-requests?status=all');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error refresh requests:', error);
      // Fallback ke router.refresh jika fetch gagal
      router.refresh();
    }
  };

  const handleApprove = async (requestId) => {
    if (loading[requestId]) return;

    setLoading(prev => ({ ...prev, [requestId]: true }));

    try {
      const response = await fetch(`/api/admin/password-reset-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          note: null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Permintaan disetujui! User akan langsung mendapat modal untuk mengatur password baru.', 'success');
        // Refresh untuk mendapatkan data terbaru dari server (termasuk yang approved)
        await refreshRequests();
      } else {
        showToast(data.error || 'Gagal menyetujui permintaan', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan', 'error');
    } finally {
      setLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId) => {
    if (loading[requestId]) return;

    if (!confirm('Apakah Anda yakin ingin menolak permintaan ini?')) {
      return;
    }

    setLoading(prev => ({ ...prev, [requestId]: true }));

    try {
      const response = await fetch(`/api/admin/password-reset-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          note: 'Permintaan ditolak',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Permintaan reset password ditolak', 'info');
        // Refresh untuk mendapatkan data terbaru dari server
        await refreshRequests();
      } else {
        showToast(data.error || 'Gagal menolak permintaan', 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan', 'error');
    } finally {
      setLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusConfig = (status, emailVerified) => {
    if (!emailVerified) {
      return {
        bg: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock,
        label: 'Menunggu Verifikasi Email'
      };
    }
    if (status === 'pending') {
      return {
        bg: 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Clock,
        label: 'Menunggu Persetujuan'
      };
    }
    if (status === 'approved') {
      return {
        bg: 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle,
        label: 'Disetujui'
      };
    }
    return {
      bg: 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-700',
      badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      icon: Clock,
      label: status
    };
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case 'user':
        return Users;
      case 'staff':
        return User;
      case 'admin':
        return Shield;
      default:
        return User;
    }
  };

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'user':
        return 'User';
      case 'staff':
        return 'Petugas';
      case 'admin':
        return 'Admin';
      default:
        return userType;
    }
  };

  if (dbError === 'DATABASE_CONNECTION_ERROR') {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl shadow-lg p-12 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
            Koneksi Database Gagal
          </h3>
          <p className="text-red-700 dark:text-red-400 mb-4">
            Tidak dapat terhubung ke MySQL server. Pastikan MySQL di Laragon sudah berjalan.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-left max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Cara memperbaiki:
            </p>
            <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
              <li>Buka aplikasi Laragon</li>
              <li>Klik tombol "Start All" atau hanya "MySQL"</li>
              <li>Pastikan status MySQL berubah menjadi hijau/aktif</li>
              <li>Refresh halaman ini</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Tidak Ada Permintaan
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Belum ada permintaan reset password yang perlu ditinjau.
          </p>
        </div>
      </div>
    );
  }

  // Pisahkan requests menjadi pending dan history
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const historyRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Reset Password Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tinjau dan setujui permintaan reset password dari user. Setelah disetujui, user akan langsung mendapat modal untuk mengatur password baru.
        </p>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Permintaan Pending ({pendingRequests.length})
          </h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const statusConfig = getStatusConfig(request.status, request.email_verified);
              const StatusIcon = statusConfig.icon;
              const UserTypeIcon = getUserTypeIcon(request.user_type);

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${statusConfig.bg}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <UserTypeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {request.user_name || 'Unknown User'}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {getUserTypeLabel(request.user_type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {request.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.badge}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Dibuat:</span>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(request.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                    {request.admin_approved_at && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Disetujui oleh:</span>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {request.admin_name || 'Admin'}
                        </p>
                      </div>
                    )}
                  </div>

                  {request.admin_note && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Catatan Admin:</strong> {request.admin_note}
                      </p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <>
                      {!request.email_verified && (
                        <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            <strong>Catatan:</strong> Email belum diverifikasi. Admin dapat menyetujui langsung tanpa menunggu verifikasi email.
                          </p>
                        </div>
                      )}
                      
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Catatan:</strong> Setelah disetujui, user akan langsung mendapat modal popup untuk mengatur password baru sendiri. Admin tidak perlu mengisi password.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={loading[request.id]}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          title="Setujui permintaan. User akan langsung mendapat modal untuk mengatur password baru."
                        >
                          {loading[request.id] ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Setujui
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={loading[request.id]}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Tolak
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Requests */}
      {historyRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            History ({historyRequests.length})
          </h2>
          <div className="space-y-4">

            {historyRequests.map((request) => {
          const statusConfig = getStatusConfig(request.status, request.email_verified);
          const StatusIcon = statusConfig.icon;
          const UserTypeIcon = getUserTypeIcon(request.user_type);

          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${statusConfig.bg}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <UserTypeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {request.user_name || 'Unknown User'}
                      </h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {getUserTypeLabel(request.user_type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {request.email}
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.badge}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Dibuat:</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(request.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                {request.admin_approved_at && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Disetujui oleh:</span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {request.admin_name || 'Admin'}
                    </p>
                  </div>
                )}
              </div>

              {request.admin_note && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Catatan Admin:</strong> {request.admin_note}
                  </p>
                </div>
              )}

              {request.status === 'approved' && request.reset_completed_at && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Status:</strong> Password telah direset pada {new Date(request.reset_completed_at).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
          </div>
        </div>
      )}
    </div>
  );
}

