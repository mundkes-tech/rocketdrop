import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken, createSecureCookie } from '@/lib/jwt';

// Helper
const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

export async function POST(req) {
  try {
    const body = await req.json();

    let { email, password, role } = body;

    // Normalize input
    email = email?.trim().toLowerCase();
    password = password?.trim();
    role = role?.trim();

    // Validate
    if (!email || !password || !role) {
      return sendResponse(false, "Email, password, and role are required.", null, 400);
    }

    // Select table
    let table;
    if (role === "user") table = "users";
    else if (role === "admin") table = "admins";
    else return sendResponse(false, "Invalid role.", null, 400);

    // Fetch account
    const [rows] = await db.query(
      `SELECT * FROM \`${table}\` WHERE email = ? LIMIT 1`,
      [email]
    );

    if (!rows || rows.length === 0) {
      return sendResponse(false, "Invalid email or password.", null, 401);
    }

    const account = rows[0];

    // Password check (hashed or plain fallback)
    const isHashed = account.password?.startsWith("$2");
    const validPassword = isHashed
      ? await bcrypt.compare(password, account.password)
      : password === account.password;

    if (!validPassword) {
      return sendResponse(false, "Invalid email or password.", null, 401);
    }

    // Prepare user data
    const userInfo = {
      id: account.id,
      name: account.name || "",
      email: account.email,
      role,
    };

    // Generate JWT tokens
    const accessToken = await generateAccessToken(userInfo);
    const refreshToken = await generateRefreshToken(userInfo);

    const redirect =
      role === "admin" ? "/admin/admin-dashboard" : "/user-dashboard";

    // Create response with tokens in HTTP-only cookies
    const response = sendResponse(true, "Login successful", { user: userInfo, redirect }, 200);

    // Set secure cookies
    response.headers.append('Set-Cookie', createSecureCookie('accessToken', accessToken, 3600)); // 1 hour
    response.headers.append('Set-Cookie', createSecureCookie('refreshToken', refreshToken, 604800)); // 7 days

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(false, "Internal server error", null, 500);
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