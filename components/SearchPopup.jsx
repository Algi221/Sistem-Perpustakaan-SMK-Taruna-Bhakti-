'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchPopup({ searchQuery, isOpen, onClose, inputRef }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim() && isOpen && inputRef?.current) {
      fetchBooks();
      updateDropdownPosition();
    } else {
      setBooks([]);
    }
  }, [searchQuery, isOpen, inputRef]);

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && inputRef?.current) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, inputRef]);

  const updateDropdownPosition = () => {
    if (inputRef?.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef?.current &&
        !inputRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, inputRef]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/books?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setBooks(data.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !searchQuery.trim()) {
    return null;
  }

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40" 
        onClick={onClose}
        style={{
          pointerEvents: 'auto'
        }}
      />
      
      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[60vh] overflow-hidden flex flex-col"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`
        }}
      >
        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-4">
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm text-gray-600">Mencari buku...</span>
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="p-4 text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600 font-medium">Tidak ada buku yang ditemukan</p>
              <p className="text-xs text-gray-500 mt-1">Coba cari dengan kata kunci lain</p>
            </div>
          ) : (
            <div className="p-2">
              <div className="space-y-1">
                {books.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    onClick={onClose}
                    className="block group"
                  >
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      {/* Book Cover */}
                      <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100 border border-gray-200">
                        {book.image_url ? (
                          <Image
                            src={book.image_url}
                            alt={book.title}
                            fill
                            className="object-cover"
                            unoptimized
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xl">📚</span>
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-0.5">
                          {book.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                          {book.author}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="inline-block bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                            {book.genre}
                          </span>
                          {book.available > 0 ? (
                            <span className="text-[10px] text-green-600 font-medium">
                              Tersedia
                            </span>
                          ) : (
                            <span className="text-[10px] text-red-600 font-medium">
                              Habis
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* View All Link */}
              {books.length >= 8 && (
                <Link
                  href={`/siswa/koleksi?search=${encodeURIComponent(searchQuery)}`}
                  onClick={onClose}
                  className="block mt-2 pt-2 text-center text-sm py-2 text-blue-600 hover:text-blue-700 font-semibold border-t border-gray-200"
                >
                  Lihat semua hasil →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

