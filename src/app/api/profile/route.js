// ✅ /src/app/api/profile/route.js
import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

// ✅ Helper for consistent responses
const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

const validRoles = ['user', 'supplier'];

/**
 * 🔹 GET — Fetch profile (by ID, email, or session)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    // 🧩 If role and email not provided, try using logged-in session cookie (optional)
    if (!role && !id && !email)
      return sendResponse(false, 'Missing role or identifier.', null, 400);

    if (!validRoles.includes(role))
      return sendResponse(false, 'Invalid role. Must be "user" or "supplier".', null, 400);

    const table = role === 'supplier' ? 'suppliers' : 'users';
    const condition = id ? 'id = ?' : 'email = ?';
    const value = id || email;

    // ✅ Choose columns dynamically
    const fields =
      role === 'supplier'
        ? 'id, company_name AS name, email, phone, address, gst_number'
        : 'id, name, email, phone, address';

    const [rows] = await db.query(
      `SELECT ${fields} FROM ${table} WHERE ${condition}`,
      [value]
    );

    if (rows.length === 0)
      return sendResponse(false, 'Profile not found.', null, 404);

    return sendResponse(true, 'Profile fetched successfully.', { profile: rows[0] });
  } catch (err) {
    console.error('❌ [GET /api/profile] Error:', err);
    return sendResponse(false, 'Server error while fetching profile.', { details: err.message }, 500);
  }
}

/**
 * 🔹 PATCH — Update profile details (by ID or email)
 */
export async function PATCH(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return sendResponse(false, 'Invalid or missing JSON body.', null, 400);

    const { id, email, role, password, ...data } = body;

    if (!role || (!id && !email))
      return sendResponse(false, 'Role and either ID or email are required.', null, 400);

    if (!validRoles.includes(role))
      return sendResponse(false, 'Invalid role. Must be "user" or "supplier".', null, 400);

    const table = role === 'supplier' ? 'suppliers' : 'users';

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    const columns = Object.keys(data);
    const values = Object.values(data);

    if (columns.length === 0)
      return sendResponse(false, 'No fields provided to update.', null, 400);

    const setClause = columns.map((col) => `${col} = ?`).join(', ');
    const condition = id ? 'id = ?' : 'email = ?';
    const identifier = id || email;

    const [result] = await db.query(
      `UPDATE ${table} SET ${setClause} WHERE ${condition}`,
      [...values, identifier]
    );

    if (result.affectedRows === 0)
      return sendResponse(false, 'Profile not found or no changes made.', null, 404);

    const [updatedRows] = await db.query(
      `SELECT id, name, email, phone, address FROM ${table} WHERE ${condition}`,
      [identifier]
    );

    return sendResponse(true, 'Profile updated successfully.', { updatedProfile: updatedRows[0] });
  } catch (err) {
    console.error('❌ [PATCH /api/profile] Error:', err);
    return sendResponse(false, 'Server error while updating profile.', { details: err.message }, 500);
  }
}




// import db from '@/lib/db';
// import bcrypt from 'bcrypt';

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const role = searchParams.get('role');
//     const id = searchParams.get('id');
//     const email = searchParams.get('email');

//     if (!role || (!id && !email)) {
//       return new Response(
//         JSON.stringify({ error: 'Role and id or email required' }),
//         { status: 400 }
//       );
//     }

//     const table = role === 'supplier' ? 'suppliers' : 'users';
//     const condition = id ? 'id = ?' : 'email = ?';
//     const value = id || email;

//     const [rows] = await db.query(`SELECT * FROM ${table} WHERE ${condition}`, [value]);

//     if (rows.length === 0)
//       return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 });

//     return new Response(JSON.stringify(rows[0]), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (err) {
//     console.error(err);
//     return new Response(
//       JSON.stringify({ error: 'Server error', details: err.message }),
//       { status: 500 }
//     );
//   }
// }

// export async function PATCH(req) {
//   try {
//     const { id, email, role, password, ...data } = await req.json();

//     if (!role || (!id && !email)) {
//       return new Response(
//         JSON.stringify({ error: 'Role and id or email required' }),
//         { status: 400 }
//       );
//     }

//     const table = role === 'supplier' ? 'suppliers' : 'users';

//     // If password is being updated, hash it
//     let updatedFields = { ...data };
//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       updatedFields.password = hashedPassword;
//     }

//     // Build dynamic query
//     const columns = Object.keys(updatedFields);
//     const values = Object.values(updatedFields);

//     if (columns.length === 0) {
//       return new Response(
//         JSON.stringify({ error: 'No fields to update' }),
//         { status: 400 }
//       );
//     }

//     const setClause = columns.map(col => `${col} = ?`).join(', ');
//     const condition = id ? 'id = ?' : 'email = ?';
//     const identifier = id || email;

//     await db.query(`UPDATE ${table} SET ${setClause} WHERE ${condition}`, [
//       ...values,
//       identifier,
//     ]);

//     return new Response(
//       JSON.stringify({ message: 'Profile updated successfully' }),
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error(err);
//     return new Response(
//       JSON.stringify({ error: 'Server error', details: err.message }),
//       { status: 500 }
//     );
//   }
// }
