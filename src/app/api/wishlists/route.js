// src/app/api/wishlists/route.js
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

/**
 * GET /api/wishlists
 * Get user's wishlist with product details
 */
export async function GET(req) {
  return requireAuth(req, async (req, user) => {
    try {
      const [wishlist] = await db.query(
        `SELECT w.id as wishlist_id, p.* 
         FROM wishlists w 
         JOIN products p ON w.product_id = p.id 
         WHERE w.user_id = ? 
         ORDER BY w.added_at DESC`,
        [user.id]
      );

      return sendResponse(true, 'Wishlist fetched', { items: wishlist });
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      return sendResponse(false, 'Failed to fetch wishlist', null, 500);
    }
  });
}

/**
 * POST /api/wishlists
 * Add product to wishlist
 */
export async function POST(req) {
  return requireAuth(req, async (req, user) => {
    try {
      const { product_id } = await req.json();

      if (!product_id) {
        return sendResponse(false, 'Product ID required', null, 400);
      }

      // Check if product exists
      const [product] = await db.query(
        'SELECT id FROM products WHERE id = ? LIMIT 1',
        [product_id]
      );

      if (!product || product.length === 0) {
        return sendResponse(false, 'Product not found', null, 404);
      }

      // Check if already in wishlist
      const [existing] = await db.query(
        'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ? LIMIT 1',
        [user.id, product_id]
      );

      if (existing.length > 0) {
        return sendResponse(false, 'Product already in wishlist', null, 409);
      }

      // Add to wishlist
      const [result] = await db.query(
        'INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)',
        [user.id, product_id]
      );

      return sendResponse(
        true,
        'Added to wishlist',
        { id: result.insertId, product_id },
        201
      );
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error);
      return sendResponse(false, 'Failed to add to wishlist', null, 500);
    }
  });
}

/**
 * DELETE /api/wishlists/:product_id
 * Remove product from wishlist
 */
export async function DELETE(req) {
  return requireAuth(req, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const product_id = searchParams.get('product_id');

      if (!product_id) {
        return sendResponse(false, 'Product ID required', null, 400);
      }

      const [result] = await db.query(
        'DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
        [user.id, product_id]
      );

      if (result.affectedRows === 0) {
        return sendResponse(false, 'Item not in wishlist', null, 404);
      }

      return sendResponse(true, 'Removed from wishlist');
    } catch (error) {
      console.error('❌ Error removing from wishlist:', error);
      return sendResponse(false, 'Failed to remove from wishlist', null, 500);
    }
  });
}
