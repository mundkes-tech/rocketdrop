import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

export async function GET(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const [rows] = await db.query(
        `SELECT id, name, email, phone, address, pincode, city, state, gender, created_at, updated_at
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
  });
}
