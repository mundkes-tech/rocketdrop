// src/app/api/reviews/route.js
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

/**
 * GET /api/reviews?product_id=123
 * Get all reviews for a product with pagination
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('product_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!productId) {
      return sendResponse(false, 'Product ID required', null, 400);
    }

    const offset = (page - 1) * limit;

    // Get reviews
    const [reviews] = await db.query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC 
       LIMIT ? OFFSET ?`,
      [productId, limit, offset]
    );

    // Get total count
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ?',
      [productId]
    );

    return sendResponse(true, 'Reviews fetched', {
      reviews,
      total: countResult[0].total,
      page,
      pages: Math.ceil(countResult[0].total / limit),
    });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return sendResponse(false, 'Failed to fetch reviews', null, 500);
  }
}

/**
 * POST /api/reviews
 * Create a new review (authenticated users only)
 */
export async function POST(req) {
  return requireAuth(req, async (req, user) => {
    try {
      const { product_id, rating, title, text } = await req.json();

      // Validation
      if (!product_id || !rating) {
        return sendResponse(false, 'Product ID and rating required', null, 400);
      }

      if (rating < 1 || rating > 5) {
        return sendResponse(false, 'Rating must be between 1 and 5', null, 400);
      }

      if (text && text.length > 5000) {
        return sendResponse(false, 'Review text too long (max 5000 chars)', null, 400);
      }

      // Check if user already reviewed this product
      const [existing] = await db.query(
        'SELECT id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1',
        [user.id, product_id]
      );

      if (existing.length > 0) {
        return sendResponse(false, 'You already reviewed this product', null, 409);
      }

      // Check if user purchased this product (for verified_purchase badge)
      const [purchase] = await db.query(
        `SELECT id FROM orders 
         WHERE user_id = ? AND JSON_CONTAINS(items, JSON_OBJECT('product_id', ?))`,
        [user.id, product_id]
      );

      const verifiedPurchase = purchase.length > 0;

      // Insert review
      const [result] = await db.query(
        `INSERT INTO reviews (product_id, user_id, rating, title, text, verified_purchase) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product_id, rating, title || null, text || null, verifiedPurchase]
      );

      // Update product's average rating (denormalized for performance)
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
        [ratingData[0].average_rating, ratingData[0].review_count, product_id]
      );

      return sendResponse(
        true,
        'Review created successfully',
        { id: result.insertId, rating, verifiedPurchase },
        201
      );
    } catch (error) {
      console.error('❌ Error creating review:', error);
      return sendResponse(false, 'Failed to create review', null, 500);
    }
  });
}
