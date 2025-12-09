import { z } from 'zod';

// Create borrowing schema
// Menggunakan coerce untuk handle string dari JSON yang perlu di-parse ke number
export const createBorrowingSchema = z.object({
  bookId: z.coerce.number()
    .int('Book ID harus berupa bilangan bulat')
    .positive('Book ID harus positif'),
  durationDays: z.coerce.number()
    .int('Durasi harus berupa bilangan bulat')
    .min(14, 'Durasi pinjam minimal 14 hari (2 minggu)')
    .max(30, 'Durasi pinjam maksimal 30 hari (1 bulan)')
    .optional()
    .default(14),
});

// Update borrowing status schema (untuk staff/admin)
export const updateBorrowingStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'borrowed', 'returned', 'return_requested']),
  staffId: z.number()
    .int('Staff ID harus berupa bilangan bulat')
    .positive('Staff ID harus positif')
    .optional(),
  rejectionReason: z.string()
    .max(500, 'Alasan penolakan maksimal 500 karakter')
    .optional()
    .nullable(),
});

