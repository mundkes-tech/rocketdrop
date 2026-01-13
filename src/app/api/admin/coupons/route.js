import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

export async function GET(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || '';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status') || '';

      const offset = (page - 1) * limit;

      // Build query
      let query = `SELECT id, code, discount_type, discount_value, max_uses, usage_count, 
                          min_purchase, is_active, valid_from, valid_until, created_at 
                   FROM coupons WHERE 1=1`;
      const params = [];

      if (search) {
        query += ` AND code LIKE ?`;
        params.push(`%${search}%`);
      }

      if (status === 'active') {
        query += ` AND is_active = 1 AND valid_from <= NOW() AND valid_until >= NOW()`;
      } else if (status === 'inactive') {
        query += ` AND is_active = 0`;
      } else if (status === 'expired') {
        query += ` AND valid_until < NOW()`;
      }

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM coupons WHERE 1=1`;
      const countParams = [];

      if (search) {
        countQuery += ` AND code LIKE ?`;
        countParams.push(`%${search}%`);
      }

      if (status === 'active') {
        countQuery += ` AND is_active = 1 AND valid_from <= NOW() AND valid_until >= NOW()`;
      } else if (status === 'inactive') {
        countQuery += ` AND is_active = 0`;
      } else if (status === 'expired') {
        countQuery += ` AND valid_until < NOW()`;
      }

      const [countResult] = await db.query(countQuery, countParams);
      const total = countResult[0].total;

      // Get paginated results
      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [coupons] = await db.query(query, params);

      return NextResponse.json({
        success: true,
        coupons,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error('❌ Error fetching coupons:', err);
      return NextResponse.json(
        { success: false, message: 'Server error' },
        { status: 500 }
      );
    }
  });
}

export async function POST(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const {
        code,
        discount_type,
        discount_value,
        max_uses,
        min_purchase,
        valid_from,
        valid_until,
        is_active,
      } = await req.json();

      // Validation
      if (!code || !discount_type || !discount_value) {
        return NextResponse.json(
          { success: false, message: 'Code, discount type, and value are required' },
          { status: 400 }
        );
      }

      if (!['percentage', 'fixed'].includes(discount_type)) {
        return NextResponse.json(
          { success: false, message: 'Invalid discount type' },
          { status: 400 }
        );
      }

      // Check if coupon code already exists
      const [existing] = await db.query('SELECT id FROM coupons WHERE code = ?', [code.toUpperCase()]);
      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Coupon code already exists' },
          { status: 400 }
        );
      }

      // Insert coupon
      const [result] = await db.query(
        `INSERT INTO coupons (code, discount_type, discount_value, max_uses, min_purchase, valid_from, valid_until, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code.toUpperCase(),
          discount_type,
          discount_value,
          max_uses || 0,
          min_purchase || 0,
          valid_from || new Date(),
          valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          is_active ? 1 : 0,
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'Coupon created successfully',
        id: result.insertId,
      });
    } catch (err) {
      console.error('❌ Error creating coupon:', err);
      return NextResponse.json(
        { success: false, message: 'Failed to create coupon' },
        { status: 500 }
      );
    }
  });
}
