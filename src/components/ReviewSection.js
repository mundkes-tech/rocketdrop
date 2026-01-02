// src/components/ReviewSection.js
'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import StarRating from './StarRating';

const fetcher = (url) => fetch(url, { credentials: 'include' }).then((res) => res.json());

export default function ReviewSection({ productId, user }) {
  const { data, mutate, error } = useSWR(
    `/api/reviews?product_id=${productId}&limit=10`,
    fetcher
  );

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to review');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, rating, title, text }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Review posted!');
        setTitle('');
        setText('');
        setRating(5);
        setShowForm(false);
        mutate();
      } else {
        toast.error(result.message || 'Failed to post review');
      }
    } catch (error) {
      toast.error('Error posting review');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Review deleted');
        mutate();
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      toast.error('Error deleting review');
    }
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

      {/* Review Form */}
      {!showForm ? (
        <button
          onClick={() => (user ? setShowForm(true) : toast.error('Please login'))}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Write a Review
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Rating</label>
            <StarRating rating={rating} onRate={setRating} size="lg" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Great product!"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Review</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience with this product..."
              rows="4"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? 'Posting...' : 'Post Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {data?.reviews && data.reviews.length > 0 ? (
          data.reviews.map((review) => (
            <div key={review.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{review.user_name}</p>
                    {review.verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.title && <p className="font-semibold mt-1">{review.title}</p>}
                </div>
                {user?.id === review.user_id && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {review.text && <p className="text-gray-700 mb-3">{review.text}</p>}

              <div className="flex gap-4 text-sm text-gray-500">
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}
