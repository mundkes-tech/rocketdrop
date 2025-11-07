import db from '@/lib/db';
import { NextResponse } from 'next/server';

// ✅ GET - Fetch products for a supplier (with pagination + filters)
// ✅ GET - Fetch products for a supplier (with pagination + filters)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const supplier_id = searchParams.get('supplier_id');
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search')?.trim() || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 8;
    const offset = (page - 1) * limit;

    if (!supplier_id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    // --- Dynamic WHERE conditions ---
    let whereClause = 'WHERE p.supplier_id = ?';
    const params = [supplier_id];

    if (category_id && category_id !== 'all') {
      whereClause += ' AND p.category_id = ?';
      params.push(category_id);
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // --- Get total count ---
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // --- Fetch only paginated results ---
    const [products] = await db.query(
      `SELECT p.*, c.name AS category
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data: products,
    });
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ✅ POST - Add new product
export async function POST(req) {
  try {
    const data = await req.json();
    const { supplier_id, category_id, name, description, price, retail_price, stock, images } = data;

    if (!supplier_id || !name || !price) {
      return NextResponse.json(
        { error: 'Supplier ID, Name, and Price are required' },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO products (supplier_id, category_id, name, description, price, retail_price, stock, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier_id,
        category_id || null,
        name,
        description || '',
        price,
        retail_price || null,
        stock || 0,
        JSON.stringify(images || []),
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      id: result.insertId,
    });
  } catch (err) {
    console.error('❌ Error adding product:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ✅ PATCH - Update existing product
export async function PATCH(req) {
  try {
    const data = await req.json();
    const { id, category_id, name, description, price, retail_price, stock, images } = data;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db.query(
      `UPDATE products 
       SET category_id = ?, name = ?, description = ?, price = ?, retail_price = ?, stock = ?, images = ?
       WHERE id = ?`,
      [
        category_id || null,
        name,
        description || '',
        price,
        retail_price || null,
        stock || 0,
        JSON.stringify(images || []),
        id,
      ]
    );

    return NextResponse.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    console.error('❌ Error updating product:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ✅ DELETE - Remove a product
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db.query(`DELETE FROM products WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


// import db from '@/lib/db';

// // GET - fetch products for a supplier
// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const supplier_id = searchParams.get('supplier_id');

//     if (!supplier_id) {
//       return new Response(JSON.stringify({ error: 'Supplier ID is required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const [products] = await db.query(
//       `SELECT p.*, c.name AS category 
//        FROM products p 
//        LEFT JOIN categories c ON p.category_id = c.id 
//        WHERE p.supplier_id = ?`,
//       [supplier_id]
//     );

//     return new Response(JSON.stringify(products), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (err) {
//     console.error('Error fetching products:', err);
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }

// // POST - add a new product
// export async function POST(req) {
//   try {
//     const data = await req.json();
//     const { supplier_id, category_id, name, description, price, retail_price, stock, images } = data;

//     if (!supplier_id || !name || !price) {
//       return new Response(JSON.stringify({ error: 'Supplier, name, and price are required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const [result] = await db.query(
//       `INSERT INTO products (supplier_id, category_id, name, description, price, retail_price, stock, images)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [supplier_id, category_id || null, name, description || '', price, retail_price || null, stock || 0, JSON.stringify(images || [])]
//     );

//     return new Response(JSON.stringify({ message: 'Product added successfully', id: result.insertId }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (err) {
//     console.error('Error adding product:', err);
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }

// // PATCH - edit/update a product
// export async function PATCH(req) {
//   try {
//     const data = await req.json();
//     const { id, category_id, name, description, price, retail_price, stock, images } = data;

//     if (!id) {
//       return new Response(JSON.stringify({ error: 'Product ID is required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     await db.query(
//       `UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, retail_price = ?, stock = ?, images = ? WHERE id = ?`,
//       [category_id || null, name, description || '', price, retail_price || null, stock || 0, JSON.stringify(images || []), id]
//     );

//     return new Response(JSON.stringify({ message: 'Product updated successfully' }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (err) {
//     console.error('Error updating product:', err);
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }

// // DELETE - delete a product
// export async function DELETE(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get('id');

//     if (!id) {
//       return new Response(JSON.stringify({ error: 'Product ID is required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     await db.query(`DELETE FROM products WHERE id = ?`, [id]);

//     return new Response(JSON.stringify({ message: 'Product deleted successfully' }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (err) {
//     console.error('Error deleting product:', err);
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
