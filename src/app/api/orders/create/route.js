// ✅ /src/app/api/orders/create/route.js
import db from '@/lib/db';
import { requireAuth } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/lib/email';

// ✅ Helper for consistent response format
const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

export async function POST(req) {
  return requireAuth(req, async (req, user) => {
    const connection = await db.getConnection();

    try {
      const body = await req.json();
      console.log('📦 Incoming Order Payload:', body);

      const { user_id, shipping, items, payment_method, total, coupon_code, coupon_discount } = body;

      // 🧩 Validate user_id matches authenticated user
      if (user_id !== user.id) {
        return sendResponse(false, 'Unauthorized: Cannot create order for another user', null, 403);
      }

      // 🧩 Validate input
      if (!shipping || Object.keys(shipping).length === 0)
        return sendResponse(false, 'Missing shipping details.', null, 400);

      if (!items || items.length === 0)
        return sendResponse(false, 'Order must contain at least one item.', null, 400);

      if (!total || isNaN(total))
        return sendResponse(false, 'Invalid total amount.', null, 400);

      // 📦 Build shipping info safely
      const recipientName = shipping.fullName || 'Unknown Recipient';
      const fullAddress = [
        shipping.address,
        shipping.city,
        shipping.state,
        shipping.zip,
      ]
        .filter(Boolean)
        .join(', ');
      const phoneNumber = shipping.phone || 'N/A';

      // ✅ Begin transaction (atomic order creation)
      await connection.beginTransaction();

    // 🧾 Insert order
    const [orderResult] = await connection.query(
      `
      INSERT INTO orders (
        user_id,
        total_amount,
        payment_mode,
        payment_status,
        status,
        recipient_name,
        shipping_address,
        phone,
        coupon_code,
        coupon_discount,
        final_total,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        user_id,
        total + (coupon_discount || 0),
        payment_method || 'cod',
        'pending',
        'pending',
        recipientName,
        fullAddress,
        phoneNumber,
        coupon_code || null,
        coupon_discount || 0,
        total,
      ]
    );

    const orderId = orderResult.insertId;
    console.log(`✅ Order created with ID: ${orderId}`);

    // 🛒 Insert order items
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price)
        throw new Error('Invalid item details.');

      await connection.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
        `,
        [orderId, item.product_id, item.quantity, item.price]
      );
      console.log(`🛍️ Added item ${item.product_id} to order ${orderId}`);
    }

    // 🚚 Create shipping details
    await connection.query(
      `
      INSERT INTO shipping_details (
        order_id,
        courier_name,
        tracking_number,
        status
      ) VALUES (?, ?, ?, ?)
      `,
      [orderId, null, null, 'pending']
    );

    console.log('🚚 Shipping details initialized.');

    // ✅ Commit transaction
    await connection.commit();

    // 📧 Send order confirmation emails (async, don't block response)
    setTimeout(async () => {
      try {
        // Send customer confirmation email
        await sendOrderConfirmationEmail({
          user_email: user.email,
          user_name: user.name || recipientName,
          order_id: orderId,
          total,
          items: items.map(item => ({
            name: item.name || 'Product',
            quantity: item.quantity,
            price: item.price,
          })),
          shipping_address: fullAddress,
        });

        // Send admin notification
        await sendAdminOrderNotification({
          order_id: orderId,
          user_name: user.name || recipientName,
          user_email: user.email,
          total,
          items: items.map(item => ({
            name: item.name || 'Product',
            quantity: item.quantity,
            price: item.price,
          })),
        });
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Don't fail the order creation if email fails
      }
    }, 0);

    return sendResponse(true, 'Order created successfully.', { orderId }, 201);
  } catch (error) {
    console.error('❌ Error creating order:', error);

    // 🚨 Rollback if any part fails
    if (connection) await connection.rollback();

    return sendResponse(
      false,
      'Failed to create order. Please try again.',
      { hint: error.message.includes('item') ? 'Check item details.' : 'Database or input issue.' },
      500
    );
  } finally {
    if (connection) connection.release();
  }
  });
}
