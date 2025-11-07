import db from '@/lib/db';
import { NextResponse } from 'next/server';

// ✅ GET — Fetch products (with search, pagination, sorting & trending)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || null;
    const category_id = searchParams.get('category_id') || null;
    const supplier_id = searchParams.get('supplier_id') || null;
    const sort = searchParams.get('sort') || 'featured';
    const minPrice = parseFloat(searchParams.get('minPrice')) || 0;
    const maxPrice = parseFloat(searchParams.get('maxPrice')) || 999999;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    const conditions = [];
    const values = [];

    if (search) {
      conditions.push(`(p.name LIKE ? OR p.description LIKE ?)`);
      values.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'all') {
      conditions.push(`EXISTS (
        SELECT 1 FROM categories c2
        WHERE c2.id = p.category_id AND c2.slug = ?
      )`);
      values.push(category);
    } else if (category_id && category_id !== 'all') {
      conditions.push(`p.category_id = ?`);
      values.push(category_id);
    }

    if (supplier_id) {
      conditions.push(`p.supplier_id = ?`);
      values.push(supplier_id);
    }

    conditions.push(`p.price BETWEEN ? AND ?`);
    values.push(minPrice, maxPrice);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'p.created_at DESC';
    let joinOrders = '';

    switch (sort) {
      case 'price-low':
        orderBy = 'p.price ASC';
        break;
      case 'price-high':
        orderBy = 'p.price DESC';
        break;
      case 'newest':
        orderBy = 'p.created_at DESC';
        break;
      case 'featured':
        orderBy = 'p.featured DESC, p.created_at DESC';
        break;
      case 'trending':
        joinOrders = `
          LEFT JOIN orders o ON o.product_id = p.id
          AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `;
        orderBy = 'COUNT(o.id) DESC';
        break;
    }

    const [products] = await db.query(
      `
      SELECT 
        p.*, 
        c.name AS category_name, 
        c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${joinOrders}
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [...values, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `
      SELECT COUNT(DISTINCT p.id) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${joinOrders}
      ${whereClause}
      `,
      values
    );

    return NextResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error while fetching products', details: error.message },
      { status: 500 }
    );
  }
}

// ✅ POST — Add new product
export async function POST(req) {
  try {
    const data = await req.json();
    const { supplier_id, category_id, name, description, price, retail_price, stock, images, featured } = data;

    if (!supplier_id || !name || !price) {
      return NextResponse.json(
        { error: 'Supplier ID, name, and price are required' },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `
      INSERT INTO products (supplier_id, category_id, name, description, price, retail_price, stock, images, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        supplier_id,
        category_id || null,
        name,
        description || '',
        price,
        retail_price || null,
        stock || 0,
        JSON.stringify(images || []),
        featured || 0,
      ]
    );

    return NextResponse.json(
      { message: 'Product added successfully', id: result.insertId },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ PATCH — Update product
export async function PATCH(req) {
  try {
    const data = await req.json();
    const { id, category_id, name, description, price, retail_price, stock, images, featured } = data;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db.query(
      `
      UPDATE products
      SET category_id=?, name=?, description=?, price=?, retail_price=?, stock=?, images=?, featured=?
      WHERE id=?
      `,
      [
        category_id || null,
        name,
        description || '',
        price,
        retail_price || null,
        stock || 0,
        JSON.stringify(images || []),
        featured || 0,
        id,
      ]
    );

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE — Delete product
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db.query(`DELETE FROM products WHERE id = ?`, [id]);

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
