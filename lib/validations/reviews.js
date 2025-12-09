import { z } from 'zod';

// Create review schema
// Menggunakan coerce untuk handle string dari JSON yang perlu di-parse ke number
export const createReviewSchema = z.object({
  bookId: z.coerce.number()
    .int('Book ID harus berupa bilangan bulat')
    .positive('Book ID harus positif'),
  borrowingId: z.coerce.number()
    .int('Borrowing ID harus berupa bilangan bulat')
    .positive('Borrowing ID harus positif'),
  rating: z.coerce.number()
    .int('Rating harus berupa bilangan bulat')
    .min(1, 'Rating minimal 1')
    .max(5, 'Rating maksimal 5'),
  review: z.string()
    .max(2000, 'Ulasan maksimal 2000 karakter')
    .optional()
    .nullable(),
});

