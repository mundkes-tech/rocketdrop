import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, address, created_at
       FROM users 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      users: rows,
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
