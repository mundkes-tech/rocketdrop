// src/app/api/cart/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireOwnership } from '@/lib/api-middleware';

// 🧠 GET: fetch user's cart (protected)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
  }

  return requireOwnership(req, userId, async (req, user) => {
    try {
      const [rows] = await db.query('SELECT cart_data FROM carts WHERE user_id = ?', [user.id]);
      
      if (rows.length === 0) {
        return NextResponse.json({ success: true, cart: [] });
      }

      const cart = typeof rows[0].cart_data === 'string'
        ? JSON.parse(rows[0].cart_data)
        : rows[0].cart_data;

      return NextResponse.json({ success: true, cart });
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
  });
}

// 🧠 POST: save/update user's cart (protected)
export async function POST(req) {
  const body = await req.json();
  const { userId, cartData } = body;

  if (!userId || !cartData) {
    return NextResponse.json({ success: false, message: 'Missing userId or cartData' }, { status: 400 });
  }

  return requireOwnership(req, userId, async (req, user) => {
    try {
      await db.query(
        `INSERT INTO carts (user_id, cart_data)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE cart_data = VALUES(cart_data)`,
        [user.id, JSON.stringify(cartData)]
      );

      return NextResponse.json({ success: true, message: 'Cart saved successfully' });
    } catch (err) {
      console.error('❌ Error saving cart:', err);
      return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
  });
}

// 🧠 DELETE: clear cart (protected)
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
  }

  return requireOwnership(req, userId, async (req, user) => {
    try {
      await db.query('DELETE FROM carts WHERE user_id = ?', [user.id]);
      return NextResponse.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
      console.error('❌ Error clearing cart:', err);
      return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
  });
}

