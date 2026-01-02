import db from '@/lib/db';
import { requireAdmin } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

// ✅ GET — Fetch all products for admin (protected)
export async function GET(req) {
  return requireAdmin(req, async (req, user) => {
    try {
      const connection = await db.getConnection();

      const [products] = await connection.query(`
        SELECT
          p.*,
          c.name as category
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `);

      // Parse images JSON and format data for frontend
      const processedProducts = products.map(product => {
        let images = [];
        try {
          // Try to parse as JSON array first
          const parsedImages = JSON.parse(product.images);
          images = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
        } catch {
          // If not JSON, treat as direct image path or array of paths
          if (product.images) {
            images = Array.isArray(product.images) ? product.images : [product.images];
          }
        }

        return {
          ...product,
          images,
          discountPrice: product.retail_price || null,
        };
      });

      connection.release();

      return NextResponse.json({
        success: true,
        products: processedProducts,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch products' },
        { status: 500 }
      );
    }
  });
}

// ✅ POST — Create new product (protected)
export async function POST(req) {
  return requireAdmin(req, async (req, user) => {
    try {
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

    const [result] = await connection.query(`
      INSERT INTO products (
        supplier_id,
        category_id,
        name,
        description,
        price,
        retail_price,
        stock,
        images,
        featured,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      1, // Default supplier_id
      categoryId,
      name,
      description,
      price,
      discountPrice || null,
      stock,
      JSON.stringify(images || []),
      0, // featured
    ]);

    connection.release();

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertId,
    });
    } catch (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create product' },
        { status: 500 }
      );
    }
  });
}