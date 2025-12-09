import { z } from 'zod';

// Update profile schema
export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Nama harus minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .optional(),
  phone: z.string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .optional()
    .nullable(),
  address: z.string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .nullable(),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string()
    .min(6, 'Password baru harus minimal 6 karakter')
    .max(100, 'Password baru maksimal 100 karakter'),
  confirmPassword: z.string()
    .min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password baru dan konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

// Change email schema
export const changeEmailSchema = z.object({
  newEmail: z.string()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter'),
  password: z.string()
    .min(1, 'Password wajib diisi untuk verifikasi'),
});

