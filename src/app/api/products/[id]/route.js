// ✅ /src/app/api/products/[id]/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// ✅ Unified response helper
const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

// ✅ GET — Fetch product details by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;

    // 🧩 Validate ID
    if (!id || isNaN(Number(id))) {
      return sendResponse(false, 'Invalid or missing product ID.', null, 400);
    }

    // 🧾 Fetch product with optional category/supplier info
    const [rows] = await db.query(
      `
      SELECT 
        p.*,
        c.name AS category_name,
        s.name AS supplier_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return sendResponse(false, 'Product not found.', null, 404);
    }

    const product = rows[0];

    // 🧠 Parse JSON fields like images if stored as strings
    if (product.images) {
      try {
        product.images = JSON.parse(product.images);
      } catch {
        product.images = [product.images]; // fallback to array
      }
    }

    // ✅ Return success response
    return sendResponse(true, 'Product fetched successfully.', { product }, 200);
  } catch (error) {
    console.error('❌ [GET /products/:id] Error:', error);
    return sendResponse(
      false,
      'Server error while fetching product. Please try again later.',
      { hint: 'Ensure product ID exists and DB connection is stable.' },
      500
    );
  }
}


// // src/app/api/products/[id]/route.js
// import { NextResponse } from 'next/server';
// import db from '@/lib/db'; // MySQL connection pool (e.g., using mysql2)

// export async function GET(req, context) {
//   const params = await context.params; // ✅ await it properly

//   try {
//     const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [params.id]);
//     if (rows.length === 0) {
//       return NextResponse.json({ message: 'Product not found' }, { status: 404 });
//     }
//     return NextResponse.json(rows[0]);
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     return NextResponse.json({ message: 'Server error' }, { status: 500 });
//   }
// }

