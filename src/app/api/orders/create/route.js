// /src/app/api/orders/create/route.js
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('📦 Incoming Order Payload:', body);

    const { user_id, shipping, items, payment_method, total } = body;

    // 🧾 Validate input
    if (!items || items.length === 0) {
      console.error('❌ No items found in order');
      return NextResponse.json({ error: 'No items found in order.' }, { status: 400 });
    }

    if (!user_id) {
      console.error('❌ Missing user_id');
      return NextResponse.json({ error: 'Missing user_id.' }, { status: 400 });
    }

    // Extract shipping info
    const recipientName = shipping.fullName || '';
    const fullAddress = `${shipping.address}, ${shipping.city}, ${shipping.state}, ${shipping.zip}`;
    const phoneNumber = shipping.phone;

    // ✅ Create order
    const [orderResult] = await db.query(
      `INSERT INTO orders (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        user_id,
        total,
        payment_method || 'cod',
        'pending',
        'pending',
        items[0].supplier_id || 1,
        recipientName,
        fullAddress,
        phoneNumber,
      ]
    );

    const orderId = orderResult.insertId;
    console.log('✅ Order created with ID:', orderId);

    // 🧩 Add order items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
      console.log(`🛒 Added item ${item.product_id} to order ${orderId}`);
    }

    // 🚚 Save shipping details (optional)
    await db.query(
      `INSERT INTO shipping_details (
        order_id,
        courier_name,
        tracking_number,
        status
      ) VALUES (?, ?, ?, ?)`,
      [orderId, null, null, 'pending']
    );

    console.log('🚚 Shipping details saved.');

    // ✅ Response
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderId,
    });

  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// // /src/app/api/orders/create/route.js
// import db from '@/lib/db';
// import { NextResponse } from 'next/server';

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     console.log('📦 Incoming Order Payload:', body);

//     const { user_id, shipping, items, payment_method, total } = body;

//     // 🧾 Validate input
//     if (!items || items.length === 0) {
//       console.error('❌ No items found in order');
//       return NextResponse.json({ error: 'No items found in order.' }, { status: 400 });
//     }

//     if (!user_id) {
//       console.error('❌ Missing user_id');
//       return NextResponse.json({ error: 'Missing user_id.' }, { status: 400 });
//     }

//     // ✅ Create a simple order (COD only)
//     const [orderResult] = await db.query(
//     `INSERT INTO orders (user_id, total_amount, payment_mode, payment_status, status, supplier_id, created_at, updated_at)
//     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//     [user_id, total, payment_method || 'cod', 'pending', 'pending', items[0].supplier_id || 1]
//     );


//     const orderId = orderResult.insertId;
//     console.log('✅ Order created with ID:', orderId);

//     // 🧩 Add order items
//     for (const item of items) {
//       await db.query(
//         `INSERT INTO order_items (order_id, product_id, quantity, price)
//          VALUES (?, ?, ?, ?)`,
//         [orderId, item.product_id, item.quantity, item.price]
//       );
//       console.log(`🛒 Added item ${item.product_id} to order ${orderId}`);
//     }

//     // 🚚 Save shipping details
//     await db.query(
//       `INSERT INTO shipping_details (
//         order_id, 
//         courier_name, 
//         tracking_number, 
//         status
//       ) VALUES (?, ?, ?, ?)`,
//       [orderId, null, null, 'pending']
//     );
//     console.log('🚚 Shipping details saved.');

//     // ✅ Response
//     return NextResponse.json({
//       success: true,
//       message: 'Order created successfully',
//       orderId,
//     });
//   } catch (error) {
//     console.error('❌ Error creating order:', error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
