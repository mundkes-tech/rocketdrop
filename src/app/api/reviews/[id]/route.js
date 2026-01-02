// src/app/api/reviews/[id]/route.js
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

/**
 * DELETE /api/reviews/[id]
 * Delete a review (owner or admin only)
 */
export async function DELETE(req, { params }) {
  return requireAuth(req, async (req, user) => {
    try {
      const { id } = params;

      // Get review
      const [review] = await db.query(
        'SELECT * FROM reviews WHERE id = ? LIMIT 1',
        [id]
      );

      if (!review || review.length === 0) {
        return sendResponse(false, 'Review not found', null, 404);
      }

      // Check authorization (owner or admin)
      if (review[0].user_id !== user.id && user.role !== 'admin') {
        return sendResponse(false, 'Unauthorized', null, 403);
      }

      const product_id = review[0].product_id;

      // Delete review
      await db.query('DELETE FROM reviews WHERE id = ?', [id]);

      // Update product rating
      const [ratingData] = await db.query(
        `SELECT 
          ROUND(AVG(rating), 2) as average_rating, 
          COUNT(*) as review_count 
         FROM reviews 
         WHERE product_id = ?`,
        [product_id]
      );

      await db.query(
        'UPDATE products SET average_rating = ?, review_count = ? WHERE id = ?',
        [
          ratingData[0].average_rating || 0,
          ratingData[0].review_count || 0,
          product_id,
        ]
      );

      return sendResponse(true, 'Review deleted');
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      return sendResponse(false, 'Failed to delete review', null, 500);
    }
  });
}

/**
 * PUT /api/reviews/[id]/helpful
 * Mark review as helpful
 */
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { helpful } = await req.json();

    if (helpful !== true && helpful !== false) {
      return sendResponse(false, 'helpful must be boolean', null, 400);
    }

    const column = helpful ? 'helpful_count' : 'unhelpful_count';

    await db.query(
      `UPDATE reviews SET ${column} = ${column} + 1 WHERE id = ?`,
      [id]
    );

    return sendResponse(true, 'Vote recorded');
  } catch (error) {
    console.error('❌ Error voting:', error);
    return sendResponse(false, 'Failed to record vote', null, 500);
  }
}
