import db from '@/lib/db';

// GET - fetch products for a supplier
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const supplier_id = searchParams.get('supplier_id');

    if (!supplier_id) {
      return new Response(JSON.stringify({ error: 'Supplier ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [products] = await db.query(
      `SELECT p.*, c.name AS category 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.supplier_id = ?`,
      [supplier_id]
    );

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST - add a new product
export async function POST(req) {
  try {
    const data = await req.json();
    const { supplier_id, category_id, name, description, price, retail_price, stock, images } = data;

    if (!supplier_id || !name || !price) {
      return new Response(JSON.stringify({ error: 'Supplier, name, and price are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [result] = await db.query(
      `INSERT INTO products (supplier_id, category_id, name, description, price, retail_price, stock, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [supplier_id, category_id || null, name, description || '', price, retail_price || null, stock || 0, JSON.stringify(images || [])]
    );

    return new Response(JSON.stringify({ message: 'Product added successfully', id: result.insertId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error adding product:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PATCH - edit/update a product
export async function PATCH(req) {
  try {
    const data = await req.json();
    const { id, category_id, name, description, price, retail_price, stock, images } = data;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.query(
      `UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, retail_price = ?, stock = ?, images = ? WHERE id = ?`,
      [category_id || null, name, description || '', price, retail_price || null, stock || 0, JSON.stringify(images || []), id]
    );

    return new Response(JSON.stringify({ message: 'Product updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error updating product:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE - delete a product
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db.query(`DELETE FROM products WHERE id = ?`, [id]);

    return new Response(JSON.stringify({ message: 'Product deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
