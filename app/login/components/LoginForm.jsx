'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Shield, Users, Eye, EyeOff, Chrome, Apple } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user', // 'user' = Siswa/Umum, 'staff' = Petugas, 'admin' = Admin
    subRole: 'siswa' // 'siswa' or 'umum' - untuk membedakan saat login
  });

  const roleOptions = [
    { value: 'user', label: 'Siswa', icon: Users, color: 'blue', subRole: 'siswa' },
    { value: 'user', label: 'Umum', icon: Users, color: 'indigo', subRole: 'umum' },
    { value: 'staff', label: 'Petugas', icon: User, color: 'green' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'purple' }
  ];
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah');
      } else if (result?.ok) {
        // Wait a bit for session to be set in cookies
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Jika ada redirect URL, gunakan itu
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
        
        // Redirect based on role
        if (formData.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (formData.role === 'staff') {
          window.location.href = '/petugas/dashboard';
        } else {
          window.location.href = '/siswa/home';
        }
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Get Started Now</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Please log in to your account to continue.</p>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Tipe Akun
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {roleOptions.map((option, index) => {
              const Icon = option.icon;
              const isSelected = option.subRole 
                ? formData.role === option.value && formData.subRole === option.subRole
                : formData.role === option.value;
              const isUserOption = option.value === 'user';
              
              return (
                <motion.button
                  key={`${option.value}-${option.subRole || index}`}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    role: option.value,
                    subRole: option.subRole || formData.subRole
                  })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? isUserOption && option.subRole === 'siswa'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                        : isUserOption && option.subRole === 'umum'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                        : option.value === 'staff'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                        : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mb-2 ${
                      isSelected
                        ? isUserOption && option.subRole === 'siswa'
                          ? 'text-blue-600 dark:text-blue-400'
                          : isUserOption && option.subRole === 'umum'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : option.value === 'staff'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold text-center ${
                      isSelected
                        ? isUserOption && option.subRole === 'siswa'
                          ? 'text-blue-700 dark:text-blue-300'
                          : isUserOption && option.subRole === 'umum'
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : option.value === 'staff'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-purple-700 dark:text-purple-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center ${
                        isUserOption && option.subRole === 'siswa'
                          ? 'bg-blue-500'
                          : isUserOption && option.subRole === 'umum'
                          ? 'bg-indigo-500'
                          : option.value === 'staff'
                          ? 'bg-green-500'
                          : 'bg-purple-500'
                      }`}
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="workmail@gmail.com"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="••••••••"
              required
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="flex justify-end"
        >
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Lupa Password?
          </button>
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          className={`group relative w-full py-3.5 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl overflow-hidden ${
            !loading
              ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700'
              : 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memproses...
            </span>
          ) : (
            <>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Log in</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </>
          )}
        </motion.button>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Belum punya akun?{' '}
          <Link href="/register" className="group inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-all">
            <span className="group-hover:underline">Daftar Sekarang</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </p>
      </motion.div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        userType={formData.role}
      />


      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative my-8"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or</span>
        </div>
      </motion.div>

      {/* Social Login Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="space-y-3"
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all bg-white dark:bg-gray-900 shadow-md hover:shadow-lg"
        >
          <Chrome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span>Login with Google</span>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all bg-white dark:bg-gray-900 shadow-md hover:shadow-lg"
        >
          <Apple className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span>Login with Apple</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
