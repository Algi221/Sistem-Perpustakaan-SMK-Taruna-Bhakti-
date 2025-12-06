'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProtectedButton({ href, children, className, ...props }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = (e) => {
    // Jika belum login, redirect ke login
    if (status === 'unauthenticated' || !session) {
      e.preventDefault();
      router.push('/login?redirect=' + encodeURIComponent(href));
    }
    // Jika sudah login, biarkan Link bekerja normal
  };

  // Jika sudah loading, render button disabled
  if (status === 'loading') {
    return (
      <span className={className} {...props}>
        {children}
      </span>
    );
  }

  // Jika sudah authenticated, render Link normal
  if (status === 'authenticated' && session) {
    return (
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    );
  }

  // Jika belum authenticated, render button dengan onClick handler
  return (
    <button 
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

