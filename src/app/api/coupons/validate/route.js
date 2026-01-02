// src/app/api/coupons/validate/route.js
import db from '@/lib/db';
import { NextResponse } from 'next/server';

const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

/**
 * POST /api/coupons/validate
 * Validate coupon code and calculate discount
 */
export async function POST(req) {
  try {
    const { code, cart_total } = await req.json();

    if (!code || !cart_total) {
      return sendResponse(false, 'Code and cart total required', null, 400);
    }

    // Fetch coupon
    const [coupon] = await db.query(
      'SELECT * FROM coupons WHERE code = ? AND active = TRUE LIMIT 1',
      [code.toUpperCase()]
    );

    if (!coupon || coupon.length === 0) {
      return sendResponse(false, 'Invalid coupon code', null, 404);
    }

    const couponData = coupon[0];

    // Check if expired
    if (couponData.expires_at && new Date(couponData.expires_at) < new Date()) {
      return sendResponse(false, 'Coupon has expired', null, 400);
    }

    // Check usage limit
    if (couponData.usage_limit && couponData.usage_count >= couponData.usage_limit) {
      return sendResponse(false, 'Coupon usage limit exceeded', null, 400);
    }

    // Check minimum amount
    if (cart_total < couponData.min_amount) {
      return sendResponse(
        false,
        `Minimum amount ${couponData.min_amount} required`,
        null,
        400
      );
    }

    // Calculate discount
    let discount = 0;
    if (couponData.discount_type === 'percentage') {
      discount = (cart_total * couponData.discount_value) / 100;
    } else {
      discount = couponData.discount_value;
    }

    // Apply max discount limit if set
    if (couponData.max_discount && discount > couponData.max_discount) {
      discount = couponData.max_discount;
    }

    const final_total = Math.max(0, cart_total - discount);

    return sendResponse(true, 'Coupon valid', {
      code: couponData.code,
      discount_type: couponData.discount_type,
      discount_value: couponData.discount_value,
      discount_amount: Math.round(discount * 100) / 100,
      original_total: cart_total,
      final_total: Math.round(final_total * 100) / 100,
    });
  } catch (error) {
    console.error('❌ Error validating coupon:', error);
    return sendResponse(false, 'Failed to validate coupon', null, 500);
  }
}
