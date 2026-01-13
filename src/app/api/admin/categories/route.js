import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

// ✅ GET — Fetch all categories for admin
export async function GET(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const [categories] = await db.query(`
        SELECT id, name, slug, image_url, created_at, updated_at
        FROM categories
        ORDER BY created_at DESC
      `);

      return NextResponse.json({
        success: true,
        categories: categories || [],
        count: (categories || []).length,
      });
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch categories' },
        { status: 500 }
      );
    }
  });
}

// ✅ POST — Create new category
export async function POST(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { name, slug, image_url } = await req.json();

      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, message: 'Category name is required' },
          { status: 400 }
        );
      }

      // Generate slug from name if not provided
      const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      // Check if category already exists
      const [existing] = await db.query(
        'SELECT id FROM categories WHERE name = ? OR slug = ?',
        [name, categorySlug]
      );

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Category already exists' },
          { status: 400 }
        );
      }

      const [result] = await db.query(
        `INSERT INTO categories (name, slug, image_url, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [name, categorySlug, image_url || null]
      );

      console.log('✅ Category created:', result.insertId);

      return NextResponse.json({
        success: true,
        message: 'Category created successfully',
        category: {
          id: result.insertId,
          name,
          slug: categorySlug,
          image_url: image_url || null,
        },
      });
    } catch (error) {
      console.error('❌ Error creating category:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create category' },
        { status: 500 }
      );
    }
  });
}
