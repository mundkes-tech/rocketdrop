// src/app/api/login/route.js
import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

// Helper function
const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

export async function POST(req) {
  try {
    const { email, password, role, admincode } = await req.json();

    // Validate fields
    if (!email || !password || !role) {
      return sendResponse(false, "Email, password, and role are required.", null, 400);
    }

    // Select correct table
    let table = "";
    if (role === "user") table = "users";
    else if (role === "admin") table = "admins";
    else return sendResponse(false, "Invalid role. Must be 'user' or 'admin'.", null, 400);

    // If admin but admincode missing
    if (role === "admin" && !admincode) {
      return sendResponse(false, "Admin Access Code is required.", null, 400);
    }

    // Fetch account from DB
    const [rows] = await db.query(`SELECT * FROM \`${table}\` WHERE email = ? LIMIT 1`, [email]);

    if (rows.length === 0) {
      return sendResponse(false, "Invalid email or password.", null, 401);
    }

    const account = rows[0];

    // Password check
    const validPassword = await bcrypt.compare(password, account.password);
    if (!validPassword) {
      return sendResponse(false, "Invalid email or password.", null, 401);
    }

    // Admin code check
    if (role === "admin") {
      if (!account.admincode) {
        return sendResponse(false, "Admin code not found for this admin.", null, 403);
      }
      if (admincode !== account.admincode) {
        return sendResponse(false, "Invalid Admin Access Code.", null, 403);
      }
    }

    // Prepare safe user data
    const userInfo = {
      id: account.id,
      name: account.name || "",
      email: account.email,
      role,
      address: account.address || "",
    };

    // Redirect path
    const redirect = role === "admin" ? "/admin-dashboard" : "/user-dashboard";

    console.log(`✅ ${role.toUpperCase()} logged in: ${email}`);

    return sendResponse(true, "Login successful", { user: userInfo, redirect }, 200);

  } catch (error) {
    console.error("❌ [POST /login] Error:", error);
    return sendResponse(
      false,
      "Internal server error. Try again later.",
      { error: error.message },
      500
    );
  }
}



// import db from '@/lib/db';
// import bcrypt from 'bcrypt';
// import { NextResponse } from 'next/server';

// // ✅ Helper for consistent response format
// const sendResponse = (success, message, data = null, status = 200) =>
//   NextResponse.json({ success, message, data }, { status });

// // ✅ POST — Login for User or Supplier
// export async function POST(req) {
//   try {
//     const { email, password, role } = await req.json();

//     // 🧩 Validate required fields
//     if (!email || !password || !role) {
//       const missing = [
//         !email && 'email',
//         !password && 'password',
//         !role && 'role',
//       ]
//         .filter(Boolean)
//         .join(', ');
//       return sendResponse(false, `Missing required field(s): ${missing}`, null, 400);
//     }

//     // ✅ Validate role strictly
//     let table;
//     if (role === 'supplier') table = 'suppliers';
//     else if (role === 'user') table = 'users';
//     else return sendResponse(false, 'Invalid role type. Must be "user" or "supplier".', null, 400);

//     // 🔒 Fetch user from DB
//     const [rows] = await db.query(`SELECT * FROM \`${table}\` WHERE email = ? LIMIT 1`, [email]);
//     if (rows.length === 0) {
//       return sendResponse(false, 'Invalid email or password.', null, 401);
//     }

//     const user = rows[0];

//     // 🧠 Validate password securely
//     if (!user.password || !(await bcrypt.compare(password, user.password))) {
//       return sendResponse(false, 'Invalid email or password.', null, 401);
//     }

//     // ✅ Prepare user info (without password)
//     const userInfo = {
//       id: user.id,
//       name: user.name || '',
//       email: user.email,
//       role,
//       address: user.address || '',
//     };

//     // ✅ Determine redirect URL
//     const redirect = role === 'supplier' ? '/supplier-dashboard' : '/user-dashboard';

//     console.log(`✅ ${role.toUpperCase()} logged in: ${email}`);

//     // 🎯 Send structured success response
//     return sendResponse(true, 'Login successful', { user: userInfo, redirect }, 200);
//   } catch (error) {
//     console.error('❌ [POST /login] Error:', error.message);
//     return sendResponse(
//       false,
//       'Internal server error while logging in. Please try again later.',
//       { hint: 'Check database connection or user table schema.' },
//       500
//     );
//   }
// }