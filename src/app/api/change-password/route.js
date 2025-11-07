import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

// ✅ Unified response helper
const sendResponse = (success, message, data = null, status = 200) =>
  NextResponse.json({ success, message, data }, { status });

// ✅ POST — Reset password (for users & suppliers)
export async function POST(req) {
  try {
    const { role, email, newPassword } = await req.json();

    // 🧩 Input validation
    if (!role || !email || !newPassword) {
      const missing = [
        !role && 'role',
        !email && 'email',
        !newPassword && 'newPassword',
      ]
        .filter(Boolean)
        .join(', ');
      return sendResponse(false, `Missing required field(s): ${missing}`, null, 400);
    }

    // ✅ Determine table safely
    let table;
    if (role === 'supplier') table = 'suppliers';
    else if (role === 'user') table = 'users';
    else return sendResponse(false, 'Invalid role type', null, 400);

    // 🔐 Hash password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🧾 Update password
    const [result] = await db.query(
      `UPDATE \`${table}\` SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    // ❌ Handle case: email not found
    if (result.affectedRows === 0) {
      return sendResponse(
        false,
        'Email not found — please check and try again.',
        { email },
        404
      );
    }

    // ✅ Success
    return sendResponse(
      true,
      'Password updated successfully! You can now log in with your new password.',
      null,
      200
    );
  } catch (error) {
    console.error('❌ [POST /reset-password] Error:', error.message);

    return sendResponse(
      false,
      'Server error while updating password. Please try again later.',
      { hint: 'Ensure your account email exists in the correct role.' },
      500
    );
  }
}


// import db from '@/lib/db';
// import bcrypt from 'bcrypt';

// export async function POST(req) {
//   try {
//     const { role, email, newPassword } = await req.json();

//     if (!role || !email || !newPassword) {
//       return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
//     }

//     const table = role === 'supplier' ? 'suppliers' : 'users';
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     const [result] = await db.query(
//       `UPDATE ${table} SET password = ? WHERE email = ?`,
//       [hashedPassword, email]
//     );

//     if (result.affectedRows === 0) {
//       return new Response(JSON.stringify({ error: 'Email not found' }), { status: 404 });
//     }

//     return new Response(
//       JSON.stringify({ message: 'Password updated successfully' }),
//       { status: 200, headers: { 'Content-Type': 'application/json' } }
//     );
//   } catch (err) {
//     console.error(err);
//     return new Response(
//       JSON.stringify({ error: 'Server error', details: err.message }),
//       { status: 500 }
//     );
//   }
// }
