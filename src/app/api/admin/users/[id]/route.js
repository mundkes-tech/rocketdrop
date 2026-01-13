import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { id } = params;

      // Get user details
      const [userResult] = await db.query(
        `SELECT id, username, email, role, created_at, updated_at 
         FROM users 
         WHERE id = ?`,
        [id]
      );

      if (userResult.length === 0) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      const userDetails = userResult[0];

      // Get user orders
      const [orders] = await db.query(
        `SELECT o.order_id, o.user_id, o.total_amount, o.payment_status, 
                o.order_status, o.created_at, COUNT(oi.item_id) as item_count
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         WHERE o.user_id = ?
         GROUP BY o.order_id
         ORDER BY o.created_at DESC`,
        [id]
      );

      // Get user statistics
      const [stats] = await db.query(
        `SELECT 
           COUNT(DISTINCT o.order_id) as total_orders,
           SUM(o.total_amount) as total_spent,
           AVG(o.total_amount) as avg_order_value
         FROM orders o
         WHERE o.user_id = ?`,
        [id]
      );

      return NextResponse.json({
        success: true,
        user: userDetails,
        orders,
        stats: stats[0],
      });
    } catch (err) {
      console.error('❌ Error fetching user details:', err);
      return NextResponse.json(
        { success: false, message: 'Server error' },
        { status: 500 }
      );
    }
  });
}
