export const translations = {
  id: {
    // General
    'general': 'Umum',
    'save': 'Simpan',
    'cancel': 'Batal',
    'settings': 'Pengaturan',
    'language': 'Bahasa',
    'fontSize': 'Ukuran Font',
    'appearance': 'Tampilan',
    'security': 'Keamanan',
    'notifications': 'Notifikasi',
    
    // Language options
    'indonesian': 'Bahasa Indonesia',
    'english': 'English',
    
    // Font size options
    'small': 'Kecil',
    'medium': 'Sedang',
    'large': 'Besar',
    'extraLarge': 'Sangat Besar',
    
    // Settings descriptions
    'languageDesc': 'Pilih bahasa yang ingin digunakan',
    'fontSizeDesc': 'Pilih ukuran font yang nyaman untuk dibaca',
    
    // Success messages
    'settingsSaved': 'Pengaturan berhasil disimpan',
    'errorOccurred': 'Terjadi kesalahan',
    
    // Sidebar
    'home': 'Beranda',
    'borrowing': 'Peminjaman',
    'collection': 'Daftar Koleksi',
    'catalog': 'Katalog Sastra',
    'favorites': 'Buku Favorit',
    'history': 'History',
    'activity': 'Aktivitas',
    'eResources': 'E-Resources',
    'event': 'Event',
    'literacyAgenda': 'Agenda Literasi',
    'location': 'Lokasi Perpustakaan',
    'account': 'Akun',
    
    // Profile
    'profile': 'Profil',
    'calendar': 'Kalender',
    'setting': 'Setting',
    
    // Buttons
    'editProfile': 'Edit Profil',
    'changePassword': 'Ubah Password',
    'darkMode': 'Mode Gelap',
    'lightMode': 'Mode Terang',
    
    // Home Page
    'welcome': 'Selamat Datang',
    'totalBorrowings': 'Total Peminjaman',
    'pending': 'Menunggu',
    'borrowed': 'Dipinjam',
    'returned': 'Dikembalikan',
    'trendingBooks': 'Buku Trending',
    'myBorrowings': 'Peminjaman Saya',
    'noBorrowings': 'Anda belum meminjam buku apapun.',
    'startExploring': 'Mulai jelajahi koleksi buku kami!',
    'exploreBooks': 'Jelajahi Buku',
    'library': 'Perpustakaan',
    'new': 'Baru',
    
    // Borrowing Page
    'borrowingDetails': 'Detail Peminjaman',
    'waitingApproval': 'Menunggu Persetujuan',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',
    'noBorrowingRequests': 'Tidak ada permintaan peminjaman.',
    'allProcessed': 'Semua permintaan telah diproses!',
    
    // Common
    'by': 'oleh',
    'daysRemaining': 'Sisa Waktu',
    'days': 'hari',
    'today': 'Hari ini',
    'overdue': 'Terlambat',
    'bookPickedUp': 'Buku Telah Diambil',
    'confirmPickup': 'Konfirmasi Buku Sudah Diambil',
  },
  en: {
    // General
    'general': 'General',
    'save': 'Save',
    'cancel': 'Cancel',
    'settings': 'Settings',
    'language': 'Language',
    'fontSize': 'Font Size',
    'appearance': 'Appearance',
    'security': 'Security',
    'notifications': 'Notifications',
    
    // Language options
    'indonesian': 'Bahasa Indonesia',
    'english': 'English',
    
    // Font size options
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'extraLarge': 'Extra Large',
    
    // Settings descriptions
    'languageDesc': 'Choose your preferred language',
    'fontSizeDesc': 'Choose a comfortable font size for reading',
    
    // Success messages
    'settingsSaved': 'Settings saved successfully',
    'errorOccurred': 'An error occurred',
    
    // Sidebar
    'home': 'Home',
    'borrowing': 'Borrowing',
    'collection': 'Collection',
    'catalog': 'Catalog',
    'favorites': 'Favorites',
    'history': 'History',
    'activity': 'Activity',
    'eResources': 'E-Resources',
    'event': 'Event',
    'literacyAgenda': 'Literacy Agenda',
    'location': 'Location',
    'account': 'Account',
    
    // Profile
    'profile': 'Profile',
    'calendar': 'Calendar',
    'setting': 'Settings',
    
    // Buttons
    'editProfile': 'Edit Profile',
    'changePassword': 'Change Password',
    'darkMode': 'Dark Mode',
    'lightMode': 'Light Mode',
    
    // Home Page
    'welcome': 'Welcome',
    'totalBorrowings': 'Total Borrowings',
    'pending': 'Pending',
    'borrowed': 'Borrowed',
    'returned': 'Returned',
    'trendingBooks': 'Trending Books',
    'myBorrowings': 'My Borrowings',
    'noBorrowings': 'You haven\'t borrowed any books yet.',
    'startExploring': 'Start exploring our book collection!',
    'exploreBooks': 'Explore Books',
    'library': 'Library',
    'new': 'New',
    
    // Borrowing Page
    'borrowingDetails': 'Borrowing Details',
    'waitingApproval': 'Waiting Approval',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'noBorrowingRequests': 'No borrowing requests.',
    'allProcessed': 'All requests have been processed!',
    
    // Common
    'by': 'by',
    'daysRemaining': 'Days Remaining',
    'days': 'days',
    'today': 'Today',
    'overdue': 'Overdue',
    'bookPickedUp': 'Book Picked Up',
    'confirmPickup': 'Confirm Book Picked Up',
  }
};

export function t(key, lang = 'id') {
  return translations[lang]?.[key] || translations.id[key] || key;
}

