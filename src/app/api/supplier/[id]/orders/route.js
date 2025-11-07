import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/supplier/[id]/orders
 * Supports:
 *   - page (default 1)
 *   - limit (default 10)
 *   - search (customer or product)
 *   - status (pending, delivered, etc.)
 *
 * Example:
 *   /api/supplier/2/orders?page=2&limit=10&status=pending&search=phone
 */
export async function GET(req, { params }) {
  const supplierId = params.id;
  const { searchParams } = new URL(req.url);

  // Query params
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const offset = (page - 1) * limit;

  try {
    // Base query
    let query = `
      SELECT 
        o.id,
        o.customer_name AS customer,
        o.product_name AS product,
        o.quantity,
        o.total_amount AS amount,
        o.status,
        o.payment_mode,         
        o.shipping_address,     
        o.created_at
      FROM orders o
      WHERE o.supplier_id = ?
    `;
    const values = [supplierId];

    // Add filters
    if (status && status !== 'all') {
      query += ` AND o.status = ?`;
      values.push(status);
    }

    if (search && search.trim() !== '') {
      query += ` AND (o.customer_name LIKE ? OR o.product_name LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

    // Count total (for pagination)
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM (${query}) AS count_query`,
      values
    );
    const total = countRows[0].total;

    // Add pagination + sorting
    query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    // Run main query
    const [rows] = await db.query(query, values);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: rows,
    });
  } catch (error) {
    console.error('❌ Error fetching supplier orders:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}


// import { NextResponse } from "next/server";
// import mysql from "mysql2/promise";

// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "Mundke@22",
//   database: "rocketdrop",
// });

// export async function GET(req, { params }) {
//   const supplierId = await params.id;
//   try {
//     const [orders] = await db.query(
//       `SELECT 
//          o.id, 
//          u.name AS customer, 
//          p.name AS product, 
//          oi.quantity, 
//          (oi.quantity * oi.price) AS amount, 
//          o.status, 
//          o.created_at
//        FROM orders o
//        JOIN users u ON o.user_id = u.id
//        JOIN order_items oi ON o.id = oi.order_id
//        JOIN products p ON oi.product_id = p.id
//        WHERE o.supplier_id = ?
//        ORDER BY o.created_at DESC`,
//       [supplierId]
//     );

//     return NextResponse.json(orders);
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
