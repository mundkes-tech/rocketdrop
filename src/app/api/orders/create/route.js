// ✅ /src/app/api/orders/create/route.js
import db from '@/lib/db';
import { NextResponse } from 'next/server';

// ✅ Helper for consistent response format
const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

export async function POST(req) {
  const connection = await db.getConnection(); // ✅ For transaction safety

  try {
    const body = await req.json();
    console.log('📦 Incoming Order Payload:', body);

    const { user_id, shipping, items, payment_method, total } = body;

    // 🧩 Validate input
    if (!user_id)
      return sendResponse(false, 'Missing required field: user_id', null, 400);

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
        supplier_id,
        recipient_name,
        shipping_address,
        phone,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        user_id,
        total,
        payment_method || 'cod',
        'pending',
        'pending',
        items[0]?.supplier_id || 1,
        recipientName,
        fullAddress,
        phoneNumber,
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
}

