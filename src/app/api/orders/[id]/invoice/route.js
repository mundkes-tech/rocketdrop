import db from '@/lib/db';
import { generateInvoicePDF } from '@/lib/invoice';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get order details
    const [orders] = await db.query(
      `SELECT o.*, u.username as customer_name, u.email as customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.order_id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return new Response('Order not found', { status: 404 });
    }

    const order = orders[0];

    // Check authorization (user must own the order or be admin)
    if (order.user_id !== decoded.userId && decoded.role !== 'admin') {
      return new Response('Forbidden', { status: 403 });
    }

    // Get order items
    const [items] = await db.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    // Prepare order data for invoice
    const orderData = {
      order_id: order.order_id,
      created_at: order.created_at,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      total_amount: parseFloat(order.total_amount),
      discount_amount: parseFloat(order.discount_amount || 0),
      payment_status: order.payment_status,
      order_status: order.order_status,
      payment_method: order.payment_method || 'Stripe',
      items: items.map((item) => ({
        product_name: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(orderData);

    // Return PDF
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('❌ Error generating invoice:', error);
    return new Response('Failed to generate invoice', { status: 500 });
  }
}
