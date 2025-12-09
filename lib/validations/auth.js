import { z } from 'zod';

// Register schema
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nama harus minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z.string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter'),
  password: z.string()
    .min(6, 'Password harus minimal 6 karakter')
    .max(100, 'Password maksimal 100 karakter'),
  role: z.enum(['siswa', 'umum']).optional().default('siswa'),
  phone: z.string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .optional()
    .nullable(),
  address: z.string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .nullable(),
});

// Login schema (untuk reference, karena login menggunakan NextAuth)
export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  role: z.enum(['admin', 'staff', 'user']).optional(),
});

