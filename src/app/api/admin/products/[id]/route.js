import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

// ✅ GET — Fetch single product (protected)
export async function GET(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { id } = params;
      const connection = await db.getConnection();

      const [products] = await connection.query(`
        SELECT
          p.*,
          c.name as category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `, [id]);

      connection.release();

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0];
    
    // Parse images field
    let images = [];
    try {
      const parsedImages = JSON.parse(product.images);
      images = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
    } catch {
      if (product.images) {
        images = Array.isArray(product.images) ? product.images : [product.images];
      }
    }
    
    product.images = images;
    product.discountPrice = product.retail_price || null; // Map to expected field name

    return NextResponse.json({
      success: true,
      product,
    });
    } catch (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch product' },
        { status: 500 }
      );
    }
  });
}

// ✅ PUT — Update product (protected)
export async function PUT(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { id } = params;
      const body = await req.json();
      const {
        name,
        description,
        price,
        discountPrice,
        stock,
      category,
      images,
    } = body;

    // Validation
    if (!name || !description || !price || stock === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();

    // Check if product exists
    const [existing] = await connection.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Get category_id from category name if provided
    let categoryId = null;
    if (category) {
      const [categoryRows] = await connection.query(
        'SELECT id FROM categories WHERE name = ? LIMIT 1',
        [category]
      );
      if (categoryRows.length > 0) {
        categoryId = categoryRows[0].id;
      }
    }

    await connection.query(`
      UPDATE products SET
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        retail_price = ?,
        stock = ?,
        images = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      categoryId,
      name,
      description,
      price,
      discountPrice || null,
      stock,
      JSON.stringify(images || []),
      id,
    ]);

    connection.release();

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
    });
    } catch (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update product' },
        { status: 500 }
    );
    }
  });
}

// ✅ DELETE — Delete product (protected)
export async function DELETE(req, { params }) {
  return requireAdmin(req, async (req, user) => {
    try {
      const { id } = params;
      const connection = await db.getConnection();

      // Check if product exists
      const [existing] = await connection.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      connection.release();
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    await connection.query('DELETE FROM products WHERE id = ?', [id]);
    connection.release();
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
    } catch (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete product' },
        { status: 500 }
      );
    }
  });
}