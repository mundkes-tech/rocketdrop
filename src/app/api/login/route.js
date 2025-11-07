import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

// ✅ Helper for consistent response format
const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

// ✅ POST — Login for User or Supplier
export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    // 🧩 Validate required fields
    if (!email || !password || !role) {
      const missing = [
        !email && 'email',
        !password && 'password',
        !role && 'role',
      ]
        .filter(Boolean)
        .join(', ');
      return sendResponse(false, `Missing required field(s): ${missing}`, null, 400);
    }

    // ✅ Validate role strictly
    let table;
    if (role === 'supplier') table = 'suppliers';
    else if (role === 'user') table = 'users';
    else return sendResponse(false, 'Invalid role type. Must be "user" or "supplier".', null, 400);

    // 🔒 Fetch user from DB
    const [rows] = await db.query(`SELECT * FROM \`${table}\` WHERE email = ? LIMIT 1`, [email]);
    if (rows.length === 0) {
      return sendResponse(false, 'Invalid email or password.', null, 401);
    }

    const user = rows[0];

    // 🧠 Validate password securely
    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      return sendResponse(false, 'Invalid email or password.', null, 401);
    }

    // ✅ Prepare user info (without password)
    const userInfo = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      role,
      address: user.address || '',
    };

    // ✅ Determine redirect URL
    const redirect = role === 'supplier' ? '/supplier-dashboard' : '/user-dashboard';

    console.log(`✅ ${role.toUpperCase()} logged in: ${email}`);

    // 🎯 Send structured success response
    return sendResponse(true, 'Login successful', { user: userInfo, redirect }, 200);
  } catch (error) {
    console.error('❌ [POST /login] Error:', error.message);
    return sendResponse(
      false,
      'Internal server error while logging in. Please try again later.',
      { hint: 'Check database connection or user table schema.' },
      500
    );
  }
}


// import db from '@/lib/db';
// import bcrypt from 'bcrypt';

// export async function POST(req) {
//   try {
//     const { email, password, role } = await req.json();

//     // Basic validation
//     if (!email || !password || !role) {
//       return new Response(
//         JSON.stringify({ error: 'Email, password, and role are required' }),
//         { status: 400, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     // Define role-based table name
//     const table = role === 'supplier' ? 'suppliers' : 'users';

//     // Fetch user/supplier from correct table
//     const [rows] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
//     if (rows.length === 0) {
//       return new Response(
//         JSON.stringify({ error: 'Invalid email or password' }),
//         { status: 401, headers: { 'Content-Type': 'application/json' } }
//       );
//     }

//     const user = rows[0];

//     // Check password (only if password column exists)
//     if (user.password) {
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return new Response(
//           JSON.stringify({ error: 'Invalid email or password' }),
//           { status: 401, headers: { 'Content-Type': 'application/json' } }
//         );
//       }
//     }

//     // ✅ Log role info in server console
//     console.log(`🟢 ${role.toUpperCase()} logged in: ${email}`);

//     // Prepare user info to return (without password)
//     const userInfo = {
//       id: user.id,
//       name: user.name || '',
//       email: user.email,
//       role: role,
//       address: user.address || '',
//     };

//     // Define redirect based on role
//     const redirect =
//       role === 'supplier' ? '/supplier-dashboard' : '/';

//     return new Response(
//       JSON.stringify({
//         message: 'Login successful',
//         user: userInfo,
//         role,
//         redirect,
//       }),
//       { status: 200, headers: { 'Content-Type': 'application/json' } }
//     );

//   } catch (error) {
//     console.error('Login error:', error);
//     return new Response(
//       JSON.stringify({ error: 'Internal server error' }),
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     );
//   }
// }


