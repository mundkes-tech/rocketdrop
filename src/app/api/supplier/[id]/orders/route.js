import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Mundke@22",
  database: "rocketdrop",
});

export async function GET(req, { params }) {
  const supplierId = await params.id;
  try {
    const [orders] = await db.query(
      `SELECT 
         o.id, 
         u.name AS customer, 
         p.name AS product, 
         oi.quantity, 
         (oi.quantity * oi.price) AS amount, 
         o.status, 
         o.created_at
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.supplier_id = ?
       ORDER BY o.created_at DESC`,
      [supplierId]
    );

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
