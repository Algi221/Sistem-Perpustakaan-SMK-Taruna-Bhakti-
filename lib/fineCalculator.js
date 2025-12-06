/**
 * Fine Calculator
 * Sistem denda: Hari 1 = Rp 2.000, Hari 2 = Rp 4.000, Hari 3 = Rp 8.000, dst (dikali 2 setiap hari)
 */

/**
 * Menghitung jumlah hari keterlambatan
 * @param {Date|string} dueDate - Tanggal jatuh tempo
 * @param {Date|string} returnDate - Tanggal pengembalian (opsional, jika null menggunakan hari ini)
 * @returns {number} Jumlah hari keterlambatan (0 jika tidak terlambat)
 */
export function calculateLateDays(dueDate, returnDate = null) {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const returnD = returnDate ? new Date(returnDate) : new Date();
  returnD.setHours(0, 0, 0, 0);
  
  const diffTime = returnD - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Menghitung total denda berdasarkan hari keterlambatan
 * Formula: 2000 * (2 ^ (days - 1))
 * Hari 1: 2000 * (2^0) = 2000
 * Hari 2: 2000 * (2^1) = 4000
 * Hari 3: 2000 * (2^2) = 8000
 * Hari 4: 2000 * (2^3) = 16000
 * dst...
 * 
 * @param {number} lateDays - Jumlah hari keterlambatan
 * @returns {number} Total denda dalam rupiah
 */
export function calculateFine(lateDays) {
  if (lateDays <= 0) {
    return 0;
  }
  
  // Base fine: Rp 2.000
  const baseFine = 2000;
  
  // Calculate: 2000 * (2 ^ (days - 1))
  const fine = baseFine * Math.pow(2, lateDays - 1);
  
  return Math.round(fine);
}

/**
 * Menghitung denda untuk peminjaman
 * @param {Date|string} dueDate - Tanggal jatuh tempo
 * @param {Date|string} returnDate - Tanggal pengembalian (opsional)
 * @returns {Object} { lateDays, fineAmount }
 */
export function calculateBorrowingFine(dueDate, returnDate = null) {
  const lateDays = calculateLateDays(dueDate, returnDate);
  const fineAmount = calculateFine(lateDays);
  
  return {
    lateDays,
    fineAmount
  };
}

/**
 * Format rupiah
 * @param {number} amount - Jumlah uang
 * @returns {string} Format rupiah (contoh: "Rp 10.000")
 */
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

