'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ChangePasswordForm from './ChangePasswordForm';
import ChangeEmailForm from './ChangeEmailForm';
import ProfileCard from '@/components/ProfileCard';

export default function ProfileInfo({ userProfile }) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [profileImage, setProfileImage] = useState(userProfile.profile_image);
  const [uploading, setUploading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [stats, setStats] = useState({
    totalBorrowings: 0,
    totalFavorites: 0,
    activeBorrowings: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const handleLogout = async () => {
    // Clear sessionStorage flag before logout
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('perpustakaan_session_active');
    }
    // Sign out and redirect to home page
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch borrowings
        const borrowingsRes = await fetch('/api/borrowings');
        const borrowings = borrowingsRes.ok ? await borrowingsRes.json() : [];
        
        // Fetch favorites
        const favoritesRes = await fetch('/api/favorites');
        const favorites = favoritesRes.ok ? await favoritesRes.json() : [];

        setStats({
          totalBorrowings: borrowings.length,
          totalFavorites: favorites.length,
          activeBorrowings: borrowings.filter(b => b.status === 'borrowed' || b.status === 'pending').length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  // Sync profileImage with session and userProfile - prioritize userProfile from database
  useEffect(() => {
    // Always use userProfile.profile_image first (from database) as it's the source of truth
    if (userProfile?.profile_image) {
      setProfileImage(userProfile.profile_image);
    } else if (session?.user?.profileImage) {
      setProfileImage(session.user.profileImage);
    }
  }, [session, userProfile]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal upload gambar');
      }

      setProfileImage(data.imageUrl);
      // Update session with trigger to fetch latest profile_image from database
      await update();
      
      // Refresh the page to load latest data from database
      router.refresh();
      alert('Foto profil berhasil diupdate!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Gagal upload gambar');
    } finally {
      setUploading(false);
    }
  };

  // Get avatar URL
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
    // Fallback to generated avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&size=400&background=6366f1&color=fff&bold=true`;
  };

  const avatarUrl = getAvatarUrl();

  // Get user handle (email without domain)
  const userHandle = userProfile.email.split('@')[0];

  // Get user title based on role
  const userTitle = userProfile.role === 'siswa' ? 'Siswa' : 'Pengguna Umum';

  return (
    <div className="space-y-8">
      {/* Profile Card Section */}
      <div className="flex justify-center animate-fade-in mb-8">
        <div className="w-full max-w-md mx-auto">
          <ProfileCard
            name={userProfile.name}
            title={userTitle}
            handle={userHandle}
            status="Online"
            contactText="Edit Foto"
            avatarUrl={avatarUrl}
            miniAvatarUrl={avatarUrl}
            showUserInfo={true}
            enableTilt={true}
            enableMobileTilt={false}
            onContactClick={() => {
              document.getElementById('profile-image-upload')?.click();
            }}
            innerGradient="linear-gradient(145deg, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.25) 50%, rgba(139, 92, 246, 0.25) 100%)"
            behindGlowColor="rgba(99, 102, 246, 0.3)"
            behindGlowSize="70%"
          />
        </div>
      </div>

      {/* Hidden file input for profile image upload */}
      <input
        id="profile-image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        disabled={uploading}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 border border-blue-400 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-100 mb-1 font-medium">Total Pinjam</p>
              <p className="text-3xl font-bold">
                {loadingStats ? '...' : stats.totalBorrowings}
              </p>
            </div>
            <span className="text-4xl opacity-80">📚</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 border border-amber-400 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-100 mb-1 font-medium">Aktif</p>
              <p className="text-3xl font-bold">
                {loadingStats ? '...' : stats.activeBorrowings}
              </p>
            </div>
            <span className="text-4xl opacity-80">📖</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-5 border border-pink-400 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-pink-100 mb-1 font-medium">Favorit</p>
              <p className="text-3xl font-bold">
                {loadingStats ? '...' : stats.totalFavorites}
              </p>
            </div>
            <span className="text-4xl opacity-80">⭐</span>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl">📋</span>
            </div>
            <span>Informasi Profil</span>
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Nama Lengkap</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white">{userProfile.name}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Email</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white break-all">{userProfile.email}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Role</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                {userProfile.role === 'siswa' ? 'Siswa' : 'Umum'}
              </p>
            </div>
            {userProfile.phone && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">No. Telepon</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{userProfile.phone}</p>
              </div>
            )}
            {userProfile.address && (
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Alamat</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{userProfile.address}</p>
              </div>
            )}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Bergabung Sejak</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                {new Date(userProfile.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">ID Pengguna</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white font-mono">
                #{userProfile.id}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-xl">⚙️</span>
            </div>
            <span>Pengaturan & Tautan Cepat</span>
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setShowEmailForm(false);
                setShowLogoutConfirm(false);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔒</span>
              <span>Ubah Password</span>
            </button>
            <button
              onClick={() => {
                setShowEmailForm(!showEmailForm);
                setShowPasswordForm(false);
                setShowLogoutConfirm(false);
              }}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-600 dark:to-gray-700 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>📧</span>
              <span>Ubah Email</span>
            </button>
            <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
              <Link
                href="/siswa/koleksi"
                className="block w-full bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3.5 rounded-xl font-semibold hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-center border-2 border-gray-300 dark:border-gray-600 mb-3 flex items-center justify-center gap-2"
              >
                <span>📚</span>
                <span>Jelajahi Koleksi</span>
              </Link>
              <Link
                href="/siswa/favorit"
                className="block w-full bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3.5 rounded-xl font-semibold hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-center border-2 border-gray-300 dark:border-gray-600 mb-3 flex items-center justify-center gap-2"
              >
                <span>⭐</span>
                <span>Buku Favorit ({stats.totalFavorites})</span>
              </Link>
            </div>
            <button
              onClick={() => {
                setShowLogoutConfirm(!showLogoutConfirm);
                setShowPasswordForm(false);
                setShowEmailForm(false);
              }}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md mt-6 animate-fade-in transition-colors duration-300">
          <div className="text-center">
            <div className="text-5xl mb-4">🚪</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Konfirmasi Keluar</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Apakah Anda yakin ingin keluar dari akun?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-red-600 dark:bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Ya, Keluar
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2.5 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Form */}
      {showPasswordForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md mt-6 transition-colors duration-300">
          <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />
        </div>
      )}

      {/* Change Email Form */}
      {showEmailForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md mt-6 transition-colors duration-300">
          <ChangeEmailForm 
            currentEmail={userProfile.email}
            onClose={() => setShowEmailForm(false)}
            onSuccess={update}
          />
        </div>
      )}
    </div>
  );
}

