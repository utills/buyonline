'use client';

import { useState } from 'react';

interface SatisfactionRatingProps {
  onRate: (rating: number) => void;
}

export default function SatisfactionRating({ onRate }: SatisfactionRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (value: number) => {
    setRating(value);
    onRate(value);
    setSubmitted(true);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center space-y-4">
      <h3 className="text-base font-semibold text-gray-900">
        How was your experience?
      </h3>
      <p className="text-sm text-gray-500">
        Rate your journey with us
      </p>

      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={submitted}
            className="p-1 transition-transform hover:scale-110 disabled:cursor-default"
          >
            <svg
              className={`w-10 h-10 ${
                star <= (hoveredRating || rating)
                  ? 'text-amber-400'
                  : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      {submitted && (
        <p className="text-sm text-green-600 font-medium">
          Thank you for your feedback!
        </p>
      )}
    </div>
  );
}
