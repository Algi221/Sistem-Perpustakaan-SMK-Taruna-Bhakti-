'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, BookOpen, AlertCircle, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';

export default function NotificationToast() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());

  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('dismissedNotifications');
      if (dismissed) {
        try {
          const dismissedSet = new Set(JSON.parse(dismissed));
          setDismissedNotifications(dismissedSet);
        } catch (error) {
          console.error('Error loading dismissed notifications:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    // Polling untuk mendapatkan notifikasi baru
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          // Filter out dismissed notifications
          const activeNotifications = (data.notifications || []).filter(
            (notif) => !dismissedNotifications.has(notif.id)
          );
          setNotifications(activeNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Fetch immediately
    fetchNotifications();

    // Poll every 3 seconds untuk update lebih cepat
    const interval = setInterval(fetchNotifications, 3000);

    return () => clearInterval(interval);
  }, [session, dismissedNotifications]);

  const handleApprove = async (borrowingId) => {
    try {
      const response = await fetch(`/api/borrowings/${borrowingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        // Find and dismiss all related notifications
        const relatedNotifications = notifications.filter(n => n.borrowingId === borrowingId);
        relatedNotifications.forEach(notif => {
          const newDismissed = new Set(dismissedNotifications);
          newDismissed.add(notif.id);
          setDismissedNotifications(newDismissed);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('dismissedNotifications', JSON.stringify(Array.from(newDismissed)));
          }
        });
        
        // Remove notification immediately
        setNotifications(prev => prev.filter(n => n.borrowingId !== borrowingId));
        // Optionally refresh after a delay
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyetujui peminjaman');
      }
    } catch (error) {
      console.error('Error approving borrowing:', error);
      alert('Gagal menyetujui peminjaman');
    }
  };

  const handleConfirmPickup = async (borrowingId) => {
    try {
      const response = await fetch(`/api/borrowings/${borrowingId}/pickup`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (response.ok) {
        const bookTitle = data.bookTitle || 'Buku';
        // Show toast notification
        showToast(`Buku "${bookTitle}" telah dikonfirmasi diambil!`, 'success');
        
        // Find and dismiss all related notifications
        const relatedNotifications = notifications.filter(n => n.borrowingId === borrowingId);
        relatedNotifications.forEach(notif => {
          const newDismissed = new Set(dismissedNotifications);
          newDismissed.add(notif.id);
          setDismissedNotifications(newDismissed);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('dismissedNotifications', JSON.stringify(Array.from(newDismissed)));
          }
        });
        
        // Remove notification immediately
        setNotifications(prev => prev.filter(n => n.borrowingId !== borrowingId));
        // Optionally refresh after a delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorMsg = data.error || 'Gagal mengonfirmasi pengambilan buku';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error confirming pickup:', error);
      showToast('Gagal mengonfirmasi pengambilan buku', 'error');
    }
  };

  const removeNotification = (id) => {
    // Add to dismissed set
    const newDismissed = new Set(dismissedNotifications);
    newDismissed.add(id);
    setDismissedNotifications(newDismissed);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissedNotifications', JSON.stringify(Array.from(newDismissed)));
    }
    
    // Remove from current notifications
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Clean up old dismissed notifications (older than 24 hours)
    // This prevents localStorage from growing too large
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const dismissed = localStorage.getItem('dismissedNotifications');
        if (dismissed) {
          try {
            const dismissedArray = JSON.parse(dismissed);
            // Keep only last 100 dismissed notifications
            if (dismissedArray.length > 100) {
              const trimmed = dismissedArray.slice(-100);
              localStorage.setItem('dismissedNotifications', JSON.stringify(trimmed));
              setDismissedNotifications(new Set(trimmed));
            }
          } catch (error) {
            console.error('Error cleaning dismissed notifications:', error);
          }
        }
      }
    }, 1000);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300"
          style={{
            animation: 'slideInRight 0.3s ease-out',
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              notification.type === 'pending' 
                ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                : notification.type === 'approved'
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : notification.type === 'pickup'
                ? 'bg-green-100 dark:bg-green-900/30'
                : notification.type === 'reset_password'
                ? 'bg-orange-100 dark:bg-orange-900/30'
                : notification.type === 'cancellation' || notification.type === 'warning'
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-green-100 dark:bg-green-900/30'
            }`}>
              {notification.type === 'pending' ? (
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              ) : notification.type === 'approved' ? (
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : notification.type === 'pickup' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : notification.type === 'reset_password' ? (
                <Key className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              ) : notification.type === 'cancellation' || notification.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {notification.message}
              </p>
              
              {/* Action Buttons */}
              {session?.user?.role === 'staff' || session?.user?.role === 'admin' ? (
                <>
                  {notification.type === 'pending' && (
                    <button
                      onClick={() => handleApprove(notification.borrowingId)}
                      className="w-full mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Acc
                    </button>
                  )}
                  {notification.type === 'reset_password' && (
                    <button
                      onClick={() => {
                        removeNotification(notification.id);
                        router.push('/admin/dashboard/reset-password');
                      }}
                      className="w-full mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      Tinjau Request
                    </button>
                  )}
                </>
              ) : (
                notification.type === 'approved' && (
                  <button
                    onClick={() => handleConfirmPickup(notification.borrowingId)}
                    className="w-full mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Konfirmasi Buku Sudah Diambil
                  </button>
                )
              )}
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

