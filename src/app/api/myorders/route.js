// /src/app/api/myorders/route.js
import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 5;
    const offset = (page - 1) * limit;

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // 🧾 Conditions
    let whereClause = `WHERE o.user_id = ?`;
    const values = [user_id];
    if (status !== 'all') {
      whereClause += ` AND o.status = ?`;
      values.push(status);
    }

    // 🧮 Count total orders
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM orders o ${whereClause}`,
      values
    );

    // 🧾 Fetch orders with pagination
    const [orders] = await db.query(
      `
      SELECT 
        o.id AS order_id,
        o.total_amount,
        o.payment_mode,
        o.payment_status,
        o.status,
        o.recipient_name,
        o.shipping_address,
        o.phone,
        o.created_at
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    if (orders.length === 0) {
      return NextResponse.json({ message: 'No orders found.', orders: [], total, totalPages: 0 });
    }

    // Fetch all items in one query for performance
    const orderIds = orders.map((o) => o.order_id);
    const [items] = await db.query(
      `
      SELECT 
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.images AS product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    // Group items under their orders
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: items.filter((item) => item.order_id === order.order_id),
    }));

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders: ordersWithItems,
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// // /src/app/api/myorders/route.js
// import db from '@/lib/db';
// import { NextResponse } from 'next/server';

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const user_id = searchParams.get('user_id');

//     if (!user_id) {
//       return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
//     }

//     // 🧾 Fetch orders with shipping info
//     const [orders] = await db.query(
//       `SELECT 
//         o.id AS order_id,
//         o.total_amount,
//         o.payment_mode,
//         o.payment_status,
//         o.status,
//         o.recipient_name,
//         o.shipping_address,
//         o.phone,
//         o.created_at,
//         s.courier_name,
//         s.tracking_number,
//         s.status AS shipping_status
//       FROM orders o
//       LEFT JOIN shipping_details s ON o.id = s.order_id
//       WHERE o.user_id = ?
//       ORDER BY o.created_at DESC`,
//       [user_id]
//     );

//     // If no orders
//     if (!orders.length) {
//       return NextResponse.json({ message: 'No orders found.' }, { status: 404 });
//     }

//     // 🛒 Fetch all items for the user's orders
//     const orderIds = orders.map((o) => o.order_id);
//     const [items] = await db.query(
//       `SELECT 
//         oi.order_id,
//         oi.product_id,
//         oi.quantity,
//         oi.price,
//         p.name AS product_name,
//         p.images AS product_image
//       FROM order_items oi
//       JOIN products p ON oi.product_id = p.id
//       WHERE oi.order_id IN (?)`,
//       [orderIds]
//     );

//     // 🔗 Group items under their order
//     const ordersWithItems = orders.map((order) => ({
//       ...order,
//       items: items.filter((item) => item.order_id === order.order_id),
//     }));

//     return NextResponse.json({ success: true, orders: ordersWithItems });

//   } catch (error) {
//     console.error('❌ Error fetching orders:', error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
