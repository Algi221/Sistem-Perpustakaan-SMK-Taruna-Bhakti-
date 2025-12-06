'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';

export default function MessageCenter() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [showCenter, setShowCenter] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchMessages();
      // Refresh setiap 10 detik
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchMessages = async () => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/messages?unreadOnly=true');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (messageIds) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      });

      if (response.ok) {
        // Update local state
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        ));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
        showToast('Semua pesan ditandai sebagai dibaca', 'success');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
      case 'cancellation_reason':
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'warning':
      case 'cancellation_reason':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (!session) return null;

  return (
    <>
      {/* Message Button */}
      <button
        onClick={() => setShowCenter(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
        aria-label="Pesan"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Message Center Modal */}
      {showCenter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pusat Pesan
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold disabled:opacity-50"
                  >
                    Tandai semua dibaca
                  </button>
                )}
                <button
                  onClick={() => setShowCenter(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Tidak ada pesan baru</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-lg p-4 border-2 ${getBgColor(message.type)} ${
                        !message.is_read ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                      } transition-all`}
                      onClick={() => {
                        if (!message.is_read) {
                          markAsRead([message.id]);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(message.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {message.type === 'cancellation_reason' 
                                ? 'Alasan Pembatalan Peminjaman'
                                : message.type === 'warning'
                                ? 'Peringatan'
                                : 'Pesan'}
                            </p>
                            {!message.is_read && (
                              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 font-bold flex-shrink-0">
                                Baru
                              </span>
                            )}
                          </div>
                          {message.book_title && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              Buku: <span className="font-medium">{message.book_title}</span>
                            </p>
                          )}
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {message.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(message.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


