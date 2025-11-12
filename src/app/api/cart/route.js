// src/app/api/cart/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db'; // ✅ your MySQL connection instance

// 🧠 GET: fetch user's cart
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
    }

    const [rows] = await db.query('SELECT cart_data FROM carts WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return NextResponse.json({ success: true, cart: [] }); // empty cart
    }

    // ✅ Parse JSON from MySQL if stored as string
    const cart = typeof rows[0].cart_data === 'string'
      ? JSON.parse(rows[0].cart_data)
      : rows[0].cart_data;

    return NextResponse.json({ success: true, cart });
  } catch (err) {
    console.error('❌ Error fetching cart:', err);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// 🧠 POST: save/update user's cart
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, cartData } = body;

    if (!userId || !cartData) {
      return NextResponse.json({ success: false, message: 'Missing userId or cartData' }, { status: 400 });
    }

    await db.query(
      `INSERT INTO carts (user_id, cart_data)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE cart_data = VALUES(cart_data)`,
      [userId, JSON.stringify(cartData)]
    );

    return NextResponse.json({ success: true, message: 'Cart saved successfully' });
  } catch (err) {
    console.error('❌ Error saving cart:', err);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

// 🧠 DELETE: clear cart
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
    }

    await db.query('DELETE FROM carts WHERE user_id = ?', [userId]);
    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('❌ Error clearing cart:', err);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
