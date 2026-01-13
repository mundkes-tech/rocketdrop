import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

// ✅ GET — Fetch single category
export async function GET(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const categoryId = params.id;

      const [categories] = await db.query(
        'SELECT id, name, slug, image_url, created_at, updated_at FROM categories WHERE id = ?',
        [categoryId]
      );

      if (categories.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Category not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        category: categories[0],
      });
    } catch (error) {
      console.error('❌ Error fetching category:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch category' },
        { status: 500 }
      );
    }
  });
}

// ✅ PUT — Update category
export async function PUT(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const categoryId = params.id;
      const { name, slug, image_url } = await req.json();

      // Validate category exists
      const [existing] = await db.query(
        'SELECT id FROM categories WHERE id = ?',
        [categoryId]
      );

      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Category not found' },
          { status: 404 }
        );
      }

      // Generate slug if needed
      const categorySlug = slug || (name && name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));

      // Check for duplicate name/slug (excluding current category)
      if (name) {
        const [duplicates] = await db.query(
          'SELECT id FROM categories WHERE (name = ? OR slug = ?) AND id != ?',
          [name, categorySlug, categoryId]
        );

        if (duplicates.length > 0) {
          return NextResponse.json(
            { success: false, message: 'Category name already exists' },
            { status: 400 }
          );
        }
      }

      const [result] = await db.query(
        `UPDATE categories 
         SET name = COALESCE(?, name),
             slug = COALESCE(?, slug),
             image_url = COALESCE(?, image_url),
             updated_at = NOW()
         WHERE id = ?`,
        [name || null, categorySlug || null, image_url || null, categoryId]
      );

      console.log('✅ Category updated:', categoryId);

      return NextResponse.json({
        success: true,
        message: 'Category updated successfully',
      });
    } catch (error) {
      console.error('❌ Error updating category:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update category' },
        { status: 500 }
      );
    }
  });
}

// ✅ DELETE — Delete category
export async function DELETE(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const categoryId = params.id;

      // Check if category exists
      const [existing] = await db.query(
        'SELECT id FROM categories WHERE id = ?',
        [categoryId]
      );

      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Category not found' },
          { status: 404 }
        );
      }

      // Check if any products use this category
      const [products] = await db.query(
        'SELECT COUNT(*) as count FROM products WHERE category = ?',
        [categoryId]
      );

      if (products[0].count > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Cannot delete category. ${products[0].count} product(s) are using it.` 
          },
          { status: 400 }
        );
      }

      const [result] = await db.query(
        'DELETE FROM categories WHERE id = ?',
        [categoryId]
      );

      console.log('✅ Category deleted:', categoryId);

      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete category' },
        { status: 500 }
      );
    }
  });
}
