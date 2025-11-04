import { NextResponse } from 'next/server';
import db from '@/lib/db'; 

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
