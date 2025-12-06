'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

// Inactivity timeout: 30 menit (dalam milliseconds)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 menit

export default function SessionManager() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (typeof window === 'undefined' || !session) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update last activity time
    lastActivityRef.current = Date.now();
    sessionStorage.setItem('perpustakaan_last_activity', lastActivityRef.current.toString());

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // User inactive for 30 minutes, sign out
      signOut({ callbackUrl: '/login', redirect: true });
    }, INACTIVITY_TIMEOUT);
  };

  // Track user activity
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Skip if on login/register page or no session
    if (pathname?.startsWith('/login') || pathname?.startsWith('/register') || !session) {
      return;
    }

    // Check if session exists but last activity is too old (browser was closed and reopened)
    const lastActivity = sessionStorage.getItem('perpustakaan_last_activity');
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        // Too much time has passed, sign out
        signOut({ callbackUrl: '/login', redirect: true });
        return;
      }
    }

    // Initialize activity tracking
    resetInactivityTimer();

    // Activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Also track visibility change (when user switches tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User came back to the tab, check if too much time has passed
        const lastActivity = sessionStorage.getItem('perpustakaan_last_activity');
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
          if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
            signOut({ callbackUrl: '/login', redirect: true });
          } else {
            resetInactivityTimer();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session, pathname]);

  // Clear sessionStorage when browser/tab is closed
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      // Clear activity tracking when browser closes
      sessionStorage.removeItem('perpustakaan_last_activity');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    const handlePageHide = (e) => {
      // Only clear if it's a page unload (not navigation within the app)
      if (e.persisted === false) {
        sessionStorage.removeItem('perpustakaan_last_activity');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  return null; // This component doesn't render anything
}

