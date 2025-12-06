import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get secret from environment or use fallback
  const secret = process.env.NEXTAUTH_SECRET || 'nextauth-secret-key-minimum-32-characters-long-for-development-only';
  
  const token = await getToken({ 
    req: request,
    secret: secret
  });

  // Landing page - redirect logged in users to their dashboard
  if (pathname === '/') {
    if (token) {
      // Redirect based on role
      if (token.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (token.role === 'staff') {
        return NextResponse.redirect(new URL('/petugas/dashboard', request.url));
      } else if (token.role === 'siswa' || token.role === 'umum') {
        return NextResponse.redirect(new URL('/siswa/home', request.url));
      }
    }
    // Allow access if not logged in
    return NextResponse.next();
  }

  // Public routes - allow access
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/images') ||
    pathname.startsWith('/books/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/img/') ||
    pathname.startsWith('/uploads/')
  ) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - require admin role
  if (pathname.startsWith('/admin')) {
    if (token.role !== 'admin') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // Petugas routes - require staff or admin role
  if (pathname.startsWith('/petugas')) {
    if (token.role !== 'staff' && token.role !== 'admin') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // Siswa routes - require user role (siswa/umum)
  if (pathname.startsWith('/siswa')) {
    if (token.role !== 'siswa' && token.role !== 'umum') {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // Legacy routes - redirect to new structure
  if (pathname.startsWith('/home')) {
    return NextResponse.redirect(new URL('/siswa/home', request.url));
  }
  if (pathname.startsWith('/staff')) {
    return NextResponse.redirect(new URL('/petugas/dashboard', request.url));
  }
  if (pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/siswa/profile', request.url));
  }
  if (pathname.startsWith('/koleksi')) {
    return NextResponse.redirect(new URL('/siswa/koleksi', request.url));
  }
  if (pathname.startsWith('/favorit')) {
    return NextResponse.redirect(new URL('/siswa/favorit', request.url));
  }
  if (pathname.startsWith('/transaksi')) {
    return NextResponse.redirect(new URL('/siswa/transaksi', request.url));
  }
  if (pathname.startsWith('/aktivitas')) {
    return NextResponse.redirect(new URL('/siswa/aktivitas', request.url));
  }
  if (pathname.startsWith('/e-resources')) {
    return NextResponse.redirect(new URL('/siswa/e-resources', request.url));
  }
  if (pathname.startsWith('/event')) {
    return NextResponse.redirect(new URL('/siswa/event', request.url));
  }
  if (pathname.startsWith('/agenda-literasi')) {
    return NextResponse.redirect(new URL('/siswa/agenda-literasi', request.url));
  }
  if (pathname.startsWith('/jadwal-pusling')) {
    return NextResponse.redirect(new URL('/siswa/jadwal-pusling', request.url));
  }
  if (pathname.startsWith('/lokasi')) {
    return NextResponse.redirect(new URL('/siswa/lokasi', request.url));
  }
  if (pathname.startsWith('/usul-buku')) {
    return NextResponse.redirect(new URL('/siswa/usul-buku', request.url));
  }
  if (pathname.startsWith('/katalog-sastra')) {
    return NextResponse.redirect(new URL('/siswa/katalog-sastra', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    
    '/((?!api/images|_next/static|_next/image|favicon.ico|img/|uploads/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
