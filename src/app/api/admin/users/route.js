import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

export async function GET(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || '';
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const role = searchParams.get('role') || '';

      const offset = (page - 1) * limit;

      // Build query
      let query = `SELECT id, username, email, role, created_at, updated_at FROM users WHERE 1=1`;
      const params = [];

      if (search) {
        query += ` AND (username LIKE ? OR email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      if (role) {
        query += ` AND role = ?`;
        params.push(role);
      }

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
      const countParams = [];

      if (search) {
        countQuery += ` AND (username LIKE ? OR email LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`);
      }

      if (role) {
        countQuery += ` AND role = ?`;
        countParams.push(role);
      }

      const [countResult] = await db.query(countQuery, countParams);
      const total = countResult[0].total;

      // Get paginated results
      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [users] = await db.query(query, params);

      return NextResponse.json({
        success: true,
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      return NextResponse.json(
        { success: false, message: 'Server error' },
        { status: 500 }
      );
    }
  });
}
