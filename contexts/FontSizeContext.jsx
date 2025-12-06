'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    // Load font size from localStorage
    const savedFontSize = localStorage.getItem('userFontSize');
    if (savedFontSize) {
      setFontSize(savedFontSize);
      applyFontSize(savedFontSize);
    } else {
      applyFontSize('medium');
    }
  }, []);

  const applyFontSize = (size) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove all font size classes
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    body.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    
    // Add new font size class
    const fontClass = `font-${size}`;
    root.classList.add(fontClass);
    body.classList.add(fontClass);
    
    // Also apply CSS variable
    const sizes = {
      small: '0.875rem',      // 14px
      medium: '1rem',         // 16px
      large: '1.125rem',      // 18px
      'extra-large': '1.25rem' // 20px
    };
    root.style.setProperty('--base-font-size', sizes[size] || sizes.medium);
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('userFontSize', size);
    applyFontSize(size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, changeFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within FontSizeProvider');
  }
  return context;
}

