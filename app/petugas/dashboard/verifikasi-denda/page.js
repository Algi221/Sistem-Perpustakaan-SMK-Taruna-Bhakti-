import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import VerifikasiDendaClient from '@/components/staff/VerifikasiDendaClient';

async function getPendingFinePayments() {
  try {
    // First, check if fine_verified_by column exists
    let hasVerificationColumns = false;
    try {
      const [columns] = await pool.execute(
        `SELECT COLUMN_NAME 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'borrowings' 
           AND COLUMN_NAME = 'fine_verified_by'`
      );
      hasVerificationColumns = columns.length > 0;
    } catch (e) {
      // If we can't check, assume columns don't exist
      hasVerificationColumns = false;
    }

    let query;
    if (hasVerificationColumns) {
      // Use full query with verification columns
      query = `SELECT b.*, 
               u.name as user_name, u.email as user_email, u.phone as user_phone,
               bk.title as book_title, bk.author, bk.image_url,
               COALESCE(s.name, a.name) as verified_by_name
               FROM borrowings b
               JOIN users u ON b.user_id = u.id
               JOIN books bk ON b.book_id = bk.id
               LEFT JOIN staff s ON b.fine_verified_by = s.id
               LEFT JOIN admin a ON b.fine_verified_by = a.id
               WHERE (b.xendit_payment_status = 'pending_verification' OR b.xendit_payment_status = 'paid')
                 AND b.fine_amount > 0
                 AND b.fine_paid = FALSE
               ORDER BY b.fine_paid_at DESC, b.id DESC`;
    } else {
      // Use query without verification columns (for backward compatibility)
      query = `SELECT b.*, 
               u.name as user_name, u.email as user_email, u.phone as user_phone,
               bk.title as book_title, bk.author, bk.image_url,
               NULL as verified_by_name
               FROM borrowings b
               JOIN users u ON b.user_id = u.id
               JOIN books bk ON b.book_id = bk.id
               WHERE (b.xendit_payment_status = 'pending_verification' OR b.xendit_payment_status = 'paid')
                 AND b.fine_amount > 0
                 AND b.fine_paid = FALSE
               ORDER BY b.fine_paid_at DESC, b.id DESC`;
    }

    const [borrowings] = await pool.execute(query);
    return borrowings;
  } catch (error) {
    console.error('Error fetching pending fine payments:', error);
    return [];
  }
}

export default async function VerifikasiDendaPage() {
  const session = await getSession();

  if (!session || (session.user.role !== 'staff' && session.user.role !== 'admin')) {
    redirect('/login');
  }

  const pendingPayments = await getPendingFinePayments();

  return <VerifikasiDendaClient initialPayments={pendingPayments} />;
}

