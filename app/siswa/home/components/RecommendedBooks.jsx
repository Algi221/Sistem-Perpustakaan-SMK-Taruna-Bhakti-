'use client';

import { useState, useEffect, useRef } from 'react';
import BookCardWithActions from '@/components/books/BookCardWithActions';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function RecommendedBooks({ initialBooks, books }) {
  // Support both prop names: initialBooks or books
  const booksData = initialBooks || books || [];
  const [selectedCategory, setSelectedCategory] = useState('Direkomendasikan');
  const [filteredBooks, setFilteredBooks] = useState(booksData);
  const [allBooks, setAllBooks] = useState(booksData);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [categories, setCategories] = useState(['Direkomendasikan']);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    // Fetch all books and genres when component mounts
    fetchAllBooks();
    fetchGenres();
  }, []);

  const fetchAllBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const books = await response.json();
      setAllBooks(books);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/books');
      const books = await response.json();
      const genres = [...new Set(books.map(book => book.genre).filter(Boolean))].sort();
      setAvailableGenres(genres);
      // Set categories: Direkomendasikan + available genres
      setCategories(['Direkomendasikan', ...genres]);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  useEffect(() => {
    if (selectedCategory === 'Direkomendasikan') {
      // Show trending/recommended books (initial books)
      setFilteredBooks(booksData);
    } else {
      // Filter by genre - case-insensitive matching
      const filtered = allBooks.filter(book => 
        book.genre && book.genre.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredBooks(filtered);
    }
  }, [selectedCategory, allBooks, booksData]);

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [filteredBooks]);

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="mb-12 animate-fade-in">
      <div className="mb-6 animate-slide-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Rekomendasi Buku</h2>
        <p className="text-gray-600 text-sm">Temukan inspirasi baca kamu!</p>
      </div>
      
      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category, idx) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all hover:scale-105 active:scale-95 animate-fade-in ${
              selectedCategory === category
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Books Scrollable with Navigation Buttons */}
      <div className="relative px-10 md:px-12">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 hover:scale-110 active:scale-95"
            aria-label="Scroll ke kiri"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 hover:scale-110 active:scale-95"
            aria-label="Scroll ke kanan"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}

        {/* Books Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, idx) => (
            <div
              key={book.id}
              className="flex-shrink-0 w-40 sm:w-48 md:w-56 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <BookCardWithActions book={book} />
            </div>
          ))
        ) : (
          <div className="w-full text-center py-8">
            <p className="text-gray-500 animate-fade-in">
              Tidak ada buku ditemukan untuk kategori "{selectedCategory}"
            </p>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}

