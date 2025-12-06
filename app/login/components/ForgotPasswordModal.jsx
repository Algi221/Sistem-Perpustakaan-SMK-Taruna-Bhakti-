'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Loader2, CheckCircle, AlertCircle, Lock, Eye, EyeOff, Clock } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function ForgotPasswordModal({ isOpen, onClose, userType = 'user' }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('request'); // 'request', 'waiting', 'approved', 'reset'
  const [requestStatus, setRequestStatus] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const checkIntervalRef = useRef(null);

  // Reset state saat modal dibuka/ditutup
  useEffect(() => {
    if (!isOpen) {
      setStep('request');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setRequestStatus(null);
      setResetToken(null);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  // Check status request setiap 3 detik jika sudah request
  useEffect(() => {
    if (!isOpen || !email || step === 'request') return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/auth/check-reset-status?email=${encodeURIComponent(email)}&userType=${userType}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.hasRequest) {
            setRequestStatus(data);
            
            if (data.status === 'approved' && data.resetToken) {
              setStep('approved');
              setResetToken(data.resetToken);
              // Stop checking once approved
              if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
              }
            } else if (data.status === 'pending') {
              setStep('waiting');
            } else if (data.status === 'rejected') {
              setStep('request');
              setError('Permintaan reset password Anda ditolak oleh admin.');
              if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
              }
            } else if (data.status === 'completed') {
              // Request sudah selesai, close modal
              onClose();
            }
          } else {
            // Request tidak ditemukan, kembali ke step request
            setStep('request');
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
              checkIntervalRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error('Error checking reset status:', error);
      }
    };

    // Check immediately
    checkStatus();

    // Check every 3 seconds
    if (!checkIntervalRef.current) {
      checkIntervalRef.current = setInterval(checkStatus, 3000);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isOpen, email, step, userType, onClose]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/request-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('waiting');
        showToast('Permintaan reset password telah dikirim. Menunggu persetujuan admin.', 'info');
      } else {
        setError(data.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim permintaan');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (!resetToken) {
      setError('Token reset tidak valid');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password berhasil direset! Silakan login dengan password baru.', 'success');
        // Close modal setelah 1.5 detik
        setTimeout(() => {
          onClose();
          // Reload page untuk login dengan password baru
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error || 'Gagal mereset password');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mereset password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === 'request' ? onClose : undefined}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step 1: Request Reset Password */}
          {step === 'request' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Lupa Password?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Masukkan email Anda. Permintaan akan dikirim ke admin untuk disetujui.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="email@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <span>Kirim Permintaan</span>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Waiting for Admin Approval */}
          {step === 'waiting' && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400 animate-pulse" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Menunggu Persetujuan Admin
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Permintaan reset password untuk <strong>{email}</strong> telah dikirim.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Admin akan meninjau permintaan Anda. Silakan tunggu...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memeriksa status...</span>
              </div>
            </div>
          )}

          {/* Step 3: Approved - Reset Password */}
          {step === 'approved' && (
            <>
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Permintaan Disetujui!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Silakan masukkan password baru Anda.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Minimal 6 karakter"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Ulangi password baru"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Mereset Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
