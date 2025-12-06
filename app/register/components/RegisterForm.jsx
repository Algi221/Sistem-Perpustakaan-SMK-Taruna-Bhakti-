'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Chrome, Apple, GraduationCap, User, Eye, EyeOff } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'siswa',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi checkbox terms
    if (!agreedToTerms) {
      setError('Anda harus menyetujui Terms & Privacy terlebih dahulu');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Terjadi kesalahan');
        return;
      }

      router.push('/login?registered=true');
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
      <p className="text-gray-600 dark:text-gray-400 mb-8">Please sign up to create your account.</p>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Enter your name"
            required
          />
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
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Tipe Akun
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'siswa', label: 'Siswa', icon: GraduationCap, color: 'blue' },
              { value: 'umum', label: 'Umum', icon: User, color: 'indigo' }
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = formData.role === option.value;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: option.value })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? option.value === 'siswa'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                        : 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mb-2 ${
                      isSelected
                        ? option.value === 'siswa'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold text-center ${
                      isSelected
                        ? option.value === 'siswa'
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-indigo-700 dark:text-indigo-300'
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
                        option.value === 'siswa'
                          ? 'bg-blue-500'
                          : 'bg-indigo-500'
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
          transition={{ delay: 0.6 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800"
              placeholder="••••••••"
              required
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center"
        >
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 cursor-pointer"
            required
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            I agree to the Terms & Privacy
          </label>
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading || !agreedToTerms}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileHover={agreedToTerms && !loading ? { scale: 1.02, y: -2 } : {}}
          whileTap={agreedToTerms && !loading ? { scale: 0.98 } : {}}
          className={`group relative w-full py-3.5 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl overflow-hidden ${
            agreedToTerms && !loading
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
              Mendaftar...
            </span>
          ) : (
            <>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Sign up</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </>
          )}
        </motion.button>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-center"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="group inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-all">
            <span className="group-hover:underline">Login Sekarang</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
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
        transition={{ delay: 1.2 }}
        className="space-y-3"
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all bg-white dark:bg-gray-900 shadow-md hover:shadow-lg"
        >
          <Chrome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span>Sign up with Google</span>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all bg-white dark:bg-gray-900 shadow-md hover:shadow-lg"
        >
          <Apple className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
          <span>Sign up with Apple</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
