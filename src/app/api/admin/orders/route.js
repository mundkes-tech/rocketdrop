import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

// ✅ GET — Fetch all orders for admin (protected)
export async function GET(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const connection = await db.getConnection();

      const [orders] = await connection.query(`
        SELECT
          o.id,
          o.user_id,
          o.total_amount as total,
          o.payment_mode as payment_method,
          o.payment_status,
          o.status,
          o.recipient_name,
          o.shipping_address,
          o.phone,
          o.cancellation_reason,
          o.cancelled_at,
          o.created_at,
          o.updated_at,
          u.name as user_name,
          u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await connection.query(`
          SELECT
            oi.quantity,
            oi.price,
            p.name,
            p.images
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id]);

        // Parse shipping details (assuming it's stored as JSON or text)
        let shipping = null;
        try {
          shipping = JSON.parse(order.shipping_address);
        } catch {
          // If not JSON, parse the address string manually
          const addressParts = order.shipping_address ? order.shipping_address.split(', ') : [];
          shipping = {
            fullName: order.recipient_name || 'N/A',
            address: addressParts[0] || order.shipping_address || 'N/A',
            city: addressParts[1] || '',
            state: addressParts[2] || '',
            postalCode: addressParts[3] || '',
            country: addressParts[4] || '',
            phone: order.phone || 'N/A',
            email: order.user_email || 'N/A',
          };
        }

        return {
          ...order,
          items: items.map(item => {
            let image = null;
            try {
              // Try to parse as JSON array first
              const parsedImages = JSON.parse(item.images);
              image = Array.isArray(parsedImages) ? parsedImages[0] : parsedImages;
            } catch {
              // If not JSON, treat as direct image path
              image = item.images;
            }
            return {
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: image,
            };
          }),
          shipping,
          user: {
            name: order.user_name,
            email: order.user_email,
          },
        };
      })
    );

    connection.release();

    return NextResponse.json({
      success: true,
      orders: ordersWithItems,
    });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch orders' },
        { status: 500 }
      );
    }
  });
}