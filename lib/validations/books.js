import { z } from 'zod';

// Create book schema
export const createBookSchema = z.object({
  title: z.string()
    .min(1, 'Judul buku wajib diisi')
    .max(255, 'Judul buku maksimal 255 karakter'),
  author: z.string()
    .min(1, 'Penulis wajib diisi')
    .max(255, 'Penulis maksimal 255 karakter'),
  isbn: z.string()
    .max(50, 'ISBN maksimal 50 karakter')
    .optional()
    .nullable(),
  genre: z.string()
    .min(1, 'Genre wajib diisi')
    .max(100, 'Genre maksimal 100 karakter'),
  description: z.string()
    .max(5000, 'Deskripsi maksimal 5000 karakter')
    .optional()
    .nullable(),
  image_url: z.string()
    .url('Format URL gambar tidak valid')
    .max(500, 'URL gambar maksimal 500 karakter')
    .optional()
    .nullable(),
  stock: z.coerce.number()
    .int('Stok harus berupa bilangan bulat')
    .min(0, 'Stok tidak boleh negatif')
    .max(10000, 'Stok maksimal 10000')
    .optional()
    .default(0),
  published_year: z.coerce.number()
    .int('Tahun terbit harus berupa bilangan bulat')
    .min(1000, 'Tahun terbit minimal 1000')
    .max(new Date().getFullYear() + 1, 'Tahun terbit tidak boleh lebih dari tahun sekarang')
    .optional()
    .nullable(),
  publisher: z.string()
    .max(255, 'Penerbit maksimal 255 karakter')
    .optional()
    .nullable(),
});

// Update book schema (semua field optional kecuali yang diperlukan)
export const updateBookSchema = z.object({
  title: z.string()
    .min(1, 'Judul buku wajib diisi')
    .max(255, 'Judul buku maksimal 255 karakter')
    .optional(),
  author: z.string()
    .min(1, 'Penulis wajib diisi')
    .max(255, 'Penulis maksimal 255 karakter')
    .optional(),
  isbn: z.string()
    .max(50, 'ISBN maksimal 50 karakter')
    .optional()
    .nullable(),
  genre: z.string()
    .min(1, 'Genre wajib diisi')
    .max(100, 'Genre maksimal 100 karakter')
    .optional(),
  description: z.string()
    .max(5000, 'Deskripsi maksimal 5000 karakter')
    .optional()
    .nullable(),
  image_url: z.string()
    .url('Format URL gambar tidak valid')
    .max(500, 'URL gambar maksimal 500 karakter')
    .optional()
    .nullable(),
  stock: z.coerce.number()
    .int('Stok harus berupa bilangan bulat')
    .min(0, 'Stok tidak boleh negatif')
    .max(10000, 'Stok maksimal 10000')
    .optional(),
  published_year: z.coerce.number()
    .int('Tahun terbit harus berupa bilangan bulat')
    .min(1000, 'Tahun terbit minimal 1000')
    .max(new Date().getFullYear() + 1, 'Tahun terbit tidak boleh lebih dari tahun sekarang')
    .optional()
    .nullable(),
  publisher: z.string()
    .max(255, 'Penerbit maksimal 255 karakter')
    .optional()
    .nullable(),
});

// Book suggestion schema
export const bookSuggestionSchema = z.object({
  title: z.string()
    .min(1, 'Judul buku wajib diisi')
    .max(255, 'Judul buku maksimal 255 karakter'),
  author: z.string()
    .min(1, 'Penulis wajib diisi')
    .max(255, 'Penulis maksimal 255 karakter'),
  isbn: z.string()
    .max(50, 'ISBN maksimal 50 karakter')
    .optional()
    .nullable(),
  genre: z.string()
    .min(1, 'Genre wajib diisi')
    .max(100, 'Genre maksimal 100 karakter'),
  reason: z.string()
    .min(10, 'Alasan minimal 10 karakter')
    .max(1000, 'Alasan maksimal 1000 karakter'),
});

