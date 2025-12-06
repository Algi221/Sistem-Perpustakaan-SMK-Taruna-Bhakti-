import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        const { email, password, role } = credentials;
        console.log('[Auth] Attempting login:', { email, role: role || 'user' });

        try {
          if (role === 'admin') {
            // Cek admin table
            const [admins] = await pool.execute(
              'SELECT * FROM admin WHERE email = ?',
              [email]
            );

            if (admins.length === 0) {
              console.log('[Auth] Admin not found:', email);
              return null;
            }

            const admin = admins[0];
            
            // Cek apakah password hash valid
            if (!admin.password || (!admin.password.startsWith('$2a$') && !admin.password.startsWith('$2b$'))) {
              console.error('[Auth] Invalid password hash format for admin:', email);
              return null;
            }

            const isValid = await bcrypt.compare(password, admin.password);

            if (!isValid) {
              console.log('[Auth] Invalid password for admin:', email);
              return null;
            }

            console.log('[Auth] Admin login successful:', email);
            return {
              id: admin.id.toString(),
              email: admin.email,
              name: admin.name,
              role: 'admin',
              profileImage: admin.profile_image || null
            };
          } else if (role === 'staff') {
            // Cek staff table
            const [staff] = await pool.execute(
              'SELECT * FROM staff WHERE email = ?',
              [email]
            );

            if (staff.length === 0) {
              console.log('[Auth] Staff not found:', email);
              return null;
            }

            const staffMember = staff[0];
            
            // Cek apakah password hash valid
            if (!staffMember.password || (!staffMember.password.startsWith('$2a$') && !staffMember.password.startsWith('$2b$'))) {
              console.error('[Auth] Invalid password hash format for staff:', email);
              return null;
            }

            const isValid = await bcrypt.compare(password, staffMember.password);

            if (!isValid) {
              console.log('[Auth] Invalid password for staff:', email);
              return null;
            }

            console.log('[Auth] Staff login successful:', email);
            return {
              id: staffMember.id.toString(),
              email: staffMember.email,
              name: staffMember.name,
              role: 'staff',
              profileImage: staffMember.profile_image || null
            };
          } else {
            // Check users table (siswa/umum)
            const [users] = await pool.execute(
              'SELECT * FROM users WHERE email = ?',
              [email]
            );

            if (users.length === 0) {
              console.log('[Auth] User not found:', email);
              return null;
            }

            const user = users[0];
            
            // Cek apakah password hash valid (harus dimulai dengan $2b$ atau $2a$)
            if (!user.password || (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$'))) {
              console.error('[Auth] Invalid password hash format for user:', email);
              return null;
            }

            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
              console.log('[Auth] Invalid password for user:', email);
              return null;
            }

            console.log('[Auth] User login successful:', email, 'role:', user.role);
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              profileImage: user.profile_image || null
            };
          }
        } catch (error) {
          console.error('[Auth] Error during authentication:', error);
          console.error('[Auth] Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
          });
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    // Session akan di-clear saat browser ditutup lewat SessionManager component
    maxAge: 30 * 24 * 60 * 60, // 30 hari (fallback, tapi di-clear saat browser ditutup)
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profileImage = user.profileImage;
      }
      
      // Ambil profile_image terbaru dari database saat session di-update atau setiap request
      if (token.id && (trigger === 'update' || !token.profileImage)) {
        try {
          if (token.role === 'admin') {
            const [admins] = await pool.execute(
              'SELECT profile_image FROM admin WHERE id = ?',
              [token.id]
            );
            if (admins.length > 0) {
              token.profileImage = admins[0].profile_image || null;
            }
          } else if (token.role === 'staff') {
            const [staff] = await pool.execute(
              'SELECT profile_image FROM staff WHERE id = ?',
              [token.id]
            );
            if (staff.length > 0) {
              token.profileImage = staff[0].profile_image || null;
            }
          } else {
            const [users] = await pool.execute(
              'SELECT profile_image FROM users WHERE id = ?',
              [token.id]
            );
            if (users.length > 0) {
              token.profileImage = users[0].profile_image || null;
            }
          }
        } catch (error) {
          // Handle error kolom yang ga ada secara silent (kolom belum ada)
          if (error.code === 'ER_BAD_FIELD_ERROR' || error.errno === 1054) {
            // Kolom ga ada, set ke null
            token.profileImage = null;
          } else {
            // Log error lainnya
          console.error('Error fetching profile image:', error);
            token.profileImage = null;
          }
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.profileImage = token.profileImage;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'nextauth-secret-key-minimum-32-characters-long-for-development-only',
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
};

// NextAuth v5 handler - create handler instance
export const handler = NextAuth(authOptions);

// Export auth function for server-side usage
export const auth = handler.auth;

// Export handlers for route usage  
export const handlers = handler.handlers;

