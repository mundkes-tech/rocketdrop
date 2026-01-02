// src/app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db'; // MySQL connection pool (e.g., using mysql2)

export async function GET(req, context) {
  const params = await context.params; // ✅ await it properly

  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [params.id]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

