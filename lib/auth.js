import { auth } from '@/lib/auth-config';

// Helper function buat ambil session di server-side
// Pake auth function dari NextAuth v5 beta
// Next.js 13+ udah nyediain request context otomatis lewat AsyncLocalStorage
export async function getSession() {
  try {
    // NextAuth v5 beta: auth() function otomatis dapet request context dari Next.js
    const session = await auth();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    console.error('Error details:', error.message, error.stack);
    return null;
  }
}

