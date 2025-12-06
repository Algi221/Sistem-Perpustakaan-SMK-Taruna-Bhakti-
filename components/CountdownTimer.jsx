'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ dueDate }) {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!dueDate) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const due = new Date(dueDate);
      const diff = due - now;

      if (diff <= 0) {
        setTimeRemaining({ expired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining({ days, hours, minutes, expired: false });
      } else if (hours > 0) {
        setTimeRemaining({ days: 0, hours, minutes, expired: false });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes, expired: false });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dueDate]);

  if (!timeRemaining) {
    return (
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
        <Clock className="w-4 h-4" />
        <span>Menghitung...</span>
      </div>
    );
  }

  if (timeRemaining.expired) {
    return (
      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm font-semibold">
        <Clock className="w-4 h-4" />
        <span>Terlambat</span>
      </div>
    );
  }

  const { days, hours, minutes } = timeRemaining;

  if (days > 0) {
    return (
      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-sm">
        <Clock className="w-4 h-4" />
        <span className="font-semibold">{days}</span>
        <span>{days === 1 ? 'hari' : 'hari'}</span>
      </div>
    );
  }

  if (hours > 0) {
    return (
      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-semibold">
        <Clock className="w-4 h-4" />
        <span>{hours}</span>
        <span>{hours === 1 ? 'jam' : 'jam'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm font-semibold">
      <Clock className="w-4 h-4" />
      <span>{minutes}</span>
      <span>{minutes === 1 ? 'menit' : 'menit'}</span>
    </div>
  );
}

