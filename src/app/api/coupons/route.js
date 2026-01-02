// src/app/api/coupons/route.js
import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

/**
 * GET /api/coupons
 * Get all active coupons (admin only)
 */
export async function GET(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const [coupons] = await db.query(
        'SELECT * FROM coupons ORDER BY created_at DESC'
      );

      return sendResponse(true, 'Coupons fetched', { coupons });
    } catch (error) {
      console.error('❌ Error fetching coupons:', error);
      return sendResponse(false, 'Failed to fetch coupons', null, 500);
    }
  });
}

/**
 * POST /api/coupons
 * Create new coupon (admin only)
 */
export async function POST(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const {
        code,
        discount_type,
        discount_value,
        min_amount,
        max_discount,
        usage_limit,
        expires_at,
      } = await req.json();

      // Validation
      if (!code || !discount_type || !discount_value) {
        return sendResponse(false, 'Missing required fields', null, 400);
      }

      if (!['percentage', 'fixed'].includes(discount_type)) {
        return sendResponse(false, 'Invalid discount type', null, 400);
      }

      if (discount_value <= 0) {
        return sendResponse(false, 'Discount value must be positive', null, 400);
      }

      // Check if code already exists
      const [existing] = await db.query(
        'SELECT id FROM coupons WHERE code = ? LIMIT 1',
        [code.toUpperCase()]
      );

      if (existing.length > 0) {
        return sendResponse(false, 'Coupon code already exists', null, 409);
      }

      // Insert coupon
      const [result] = await db.query(
        `INSERT INTO coupons (
          code, discount_type, discount_value, min_amount, 
          max_discount, usage_limit, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          code.toUpperCase(),
          discount_type,
          discount_value,
          min_amount || 0,
          max_discount || null,
          usage_limit || null,
          expires_at || null,
        ]
      );

      return sendResponse(
        true,
        'Coupon created',
        { id: result.insertId, code: code.toUpperCase() },
        201
      );
    } catch (error) {
      console.error('❌ Error creating coupon:', error);
      return sendResponse(false, 'Failed to create coupon', null, 500);
    }
  });
}
