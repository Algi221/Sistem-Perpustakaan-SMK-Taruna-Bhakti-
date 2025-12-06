'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ href }) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors mb-6 group font-semibold"
    >
      <svg 
        className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>Kembali</span>
    </button>
  );
}

