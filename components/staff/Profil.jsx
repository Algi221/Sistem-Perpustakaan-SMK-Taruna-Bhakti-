'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Shield, 
  Camera, CheckCircle2, AlertCircle, Sparkles, BadgeCheck
} from 'lucide-react';
import ProfileCard from '@/components/ProfileCard';

export default function Profil({ userData, stats }) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(userData.profile_image);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    phone: userData.phone || '',
    address: userData.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (userData?.profile_image) {
      setProfileImage(userData.profile_image);
    } else if (session?.user?.profileImage) {
      setProfileImage(session.user.profileImage);
    }
  }, [session, userData]);

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        name: formData.name
      };
      
      if (userData.role === 'staff' && formData.phone !== undefined) {
        updateData.phone = formData.phone;
      }
      
      if (userData.address !== undefined && formData.address !== undefined) {
        updateData.address = formData.address;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui' });
        setIsEditing(false);
        await update();
        router.refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal memperbarui profil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File harus berupa gambar' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran file maksimal 2MB' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin-staff/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal upload gambar');
      }

      setProfileImage(data.imageUrl);
      await update();
      router.refresh();
      setMessage({ type: 'success', text: 'Foto profil berhasil diupdate!' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: error.message || 'Gagal upload gambar' });
    } finally {
      setUploading(false);
    }
  };

  const getAvatarUrl = () => {
    if (profileImage) {
      if (profileImage.startsWith('http')) {
        return profileImage;
      }
      if (profileImage.startsWith('/')) {
        return profileImage;
      }
      return `/uploads/${profileImage}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=400&background=${userData.role === 'admin' ? '64748b' : '6366f1'}&color=fff&bold=true`;
  };

  const avatarUrl = getAvatarUrl();
  const userHandle = userData.email.split('@')[0];
  const userTitle = userData.role === 'staff' ? 'Petugas Perpustakaan' : userData.role === 'admin' ? 'Administrator' : 'User';
  const isAdmin = userData.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isAdmin ? 'bg-gradient-to-br from-slate-600 to-slate-700' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} shadow-lg`}>
              <User className="w-8 h-8 text-white" />
            </div>
            <span>Profil Saya</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Kelola informasi profil Anda</p>
        </motion.div>

        {/* Message Toast */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg ${
              message.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}

        {/* Profile Card Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="w-full max-w-md">
            <ProfileCard
              name={userData.name}
              title={userTitle}
              handle={userHandle}
              status="Online"
              contactText={uploading ? "Uploading..." : "Edit Foto"}
              avatarUrl={avatarUrl}
              miniAvatarUrl={avatarUrl}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => {
                if (!uploading) {
                  document.getElementById('profile-image-upload-staff')?.click();
                }
              }}
              innerGradient={isAdmin
                ? "linear-gradient(145deg, rgba(148, 163, 184, 0.15) 0%, rgba(203, 213, 225, 0.15) 50%, rgba(226, 232, 240, 0.15) 100%)"
                : "linear-gradient(145deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.25) 50%, rgba(29, 78, 216, 0.25) 100%)"
              }
              behindGlowColor={isAdmin
                ? "rgba(148, 163, 184, 0.25)"
                : "rgba(59, 130, 246, 0.3)"
              }
              behindGlowSize="70%"
            />
          </div>
        </motion.div>

        {/* Hidden file input */}
        <input
          id="profile-image-upload-staff"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={uploading}
        />

        {/* Statistics Cards - Only for staff */}
        {!isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 border border-blue-400 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1 font-medium">Total Peminjaman</p>
                  <p className="text-4xl font-bold">{stats.total}</p>
                </div>
                <span className="text-5xl opacity-80">📚</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 border border-green-400 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1 font-medium">Disetujui</p>
                  <p className="text-4xl font-bold">{stats.approved}</p>
                </div>
                <span className="text-5xl opacity-80">✅</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 border border-purple-400 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1 font-medium">Aktif</p>
                  <p className="text-4xl font-bold">{stats.active}</p>
                </div>
                <span className="text-5xl opacity-80">📖</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl shadow-lg ${
                isAdmin
                  ? 'bg-gradient-to-br from-slate-500 to-slate-600'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Informasi Profil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kelola data pribadi Anda</p>
              </div>
            </div>
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Edit className="w-5 h-5" />
                Edit Profil
              </motion.button>
            ) : (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Simpan
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  <X className="w-5 h-5" />
                  Batal
                </motion.button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                <User className="w-5 h-5" />
                Nama Lengkap
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                />
              ) : (
                <p className="font-bold text-xl text-gray-900 dark:text-white">{userData.name || '-'}</p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
            >
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                <Mail className="w-5 h-5" />
                Email
              </label>
              <p className="font-bold text-xl text-gray-900 dark:text-white break-all">{userData.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Email tidak dapat diubah</p>
            </motion.div>

            {/* Role */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
            >
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                <BadgeCheck className="w-5 h-5" />
                Role
              </label>
              <div className="flex items-center gap-2">
                <p className="font-bold text-xl text-gray-900 dark:text-white">
                  {userData.role === 'staff' ? 'Petugas Perpustakaan' : userData.role === 'admin' ? 'Administrator' : 'User'}
                </p>
                {isAdmin && (
                  <Sparkles className="w-5 h-5 text-amber-500" />
                )}
              </div>
            </motion.div>

            {/* Phone - Only for staff */}
            {(userData.role === 'staff' || userData.phone) && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-cyan-200/50 dark:border-cyan-800/50 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all"
              >
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                  <Phone className="w-5 h-5" />
                  Nomor Telepon
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-cyan-300 dark:border-cyan-700 rounded-xl focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-cyan-500 dark:focus:border-cyan-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold"
                    placeholder="08xxxxxxxxxx"
                  />
                ) : (
                  <p className="font-bold text-xl text-gray-900 dark:text-white">{userData.phone || '-'}</p>
                )}
              </motion.div>
            )}

            {/* Address */}
            {userData.address && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border-2 border-orange-200/50 dark:border-orange-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-all md:col-span-2"
              >
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                  <MapPin className="w-5 h-5" />
                  Alamat
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-orange-300 dark:border-orange-700 rounded-xl focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none font-semibold"
                    rows="3"
                    placeholder="Masukkan alamat lengkap"
                  />
                ) : (
                  <p className="font-bold text-xl text-gray-900 dark:text-white">{userData.address || '-'}</p>
                )}
              </motion.div>
            )}

            {/* Join Date */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-800 rounded-2xl border-2 border-gray-200/50 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
            >
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                <Calendar className="w-5 h-5" />
                Bergabung Sejak
              </label>
              <p className="font-bold text-xl text-gray-900 dark:text-white">
                {new Date(userData.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </motion.div>

            {/* User ID */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl border-2 border-indigo-200/50 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                <Shield className="w-5 h-5" />
                ID Pengguna
              </label>
              <p className="font-bold text-xl text-gray-900 dark:text-white font-mono">
                #{userData.id}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
