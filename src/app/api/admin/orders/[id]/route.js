import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

// ✅ PUT — Update order status (protected)
export async function PUT(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { id } = params;
      const body = await req.json();
      const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    // Check if order exists
    const [existing] = await connection.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    await connection.query(`
      UPDATE orders SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [status, id]);

    connection.release();
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
    });
    } catch (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update order' },
        { status: 500 }
      );
    }
  });
}