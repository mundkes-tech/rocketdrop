// src/components/StarRating.js
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onRate = null, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => onRate && setHoverRating(star)}
          onMouseLeave={() => onRate && setHoverRating(0)}
          disabled={!onRate}
          className={`transition-transform ${
            onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
        >
          <Star
            className={`${sizeClass} ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
