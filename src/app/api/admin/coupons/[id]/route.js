import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { id } = params;

      const [coupons] = await db.query(
        `SELECT * FROM coupons WHERE id = ?`,
        [id]
      );

      if (coupons.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Coupon not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        coupon: coupons[0],
      });
    } catch (err) {
      console.error('❌ Error fetching coupon:', err);
      return NextResponse.json(
        { success: false, message: 'Server error' },
        { status: 500 }
      );
    }
  });
}

export async function PUT(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { id } = params;
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

      // Check if coupon exists
      const [existing] = await db.query('SELECT id FROM coupons WHERE id = ?', [id]);
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Coupon not found' },
          { status: 404 }
        );
      }

      // Check if new code already exists (if changed)
      if (code) {
        const [duplicate] = await db.query(
          'SELECT id FROM coupons WHERE code = ? AND id != ?',
          [code.toUpperCase(), id]
        );
        if (duplicate.length > 0) {
          return NextResponse.json(
            { success: false, message: 'Coupon code already exists' },
            { status: 400 }
          );
        }
      }

      // Update coupon
      const updateFields = [];
      const updateParams = [];

      if (code) {
        updateFields.push('code = ?');
        updateParams.push(code.toUpperCase());
      }
      if (discount_type) {
        updateFields.push('discount_type = ?');
        updateParams.push(discount_type);
      }
      if (discount_value !== undefined) {
        updateFields.push('discount_value = ?');
        updateParams.push(discount_value);
      }
      if (max_uses !== undefined) {
        updateFields.push('max_uses = ?');
        updateParams.push(max_uses);
      }
      if (min_purchase !== undefined) {
        updateFields.push('min_purchase = ?');
        updateParams.push(min_purchase);
      }
      if (valid_from) {
        updateFields.push('valid_from = ?');
        updateParams.push(valid_from);
      }
      if (valid_until) {
        updateFields.push('valid_until = ?');
        updateParams.push(valid_until);
      }
      if (is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateParams.push(is_active ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No fields to update' },
          { status: 400 }
        );
      }

      updateParams.push(id);

      await db.query(
        `UPDATE coupons SET ${updateFields.join(', ')} WHERE id = ?`,
        updateParams
      );

      return NextResponse.json({
        success: true,
        message: 'Coupon updated successfully',
      });
    } catch (err) {
      console.error('❌ Error updating coupon:', err);
      return NextResponse.json(
        { success: false, message: 'Failed to update coupon' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { id } = params;

      // Check if coupon exists
      const [existing] = await db.query('SELECT id FROM coupons WHERE id = ?', [id]);
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Coupon not found' },
          { status: 404 }
        );
      }

      // Delete coupon
      await db.query('DELETE FROM coupons WHERE id = ?', [id]);

      return NextResponse.json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    } catch (err) {
      console.error('❌ Error deleting coupon:', err);
      return NextResponse.json(
        { success: false, message: 'Failed to delete coupon' },
        { status: 500 }
      );
    }
  });
}
