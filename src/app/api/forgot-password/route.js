import db from '@/lib/db';

export async function POST(req) {
  try {
    const { role, email } = await req.json();

    if (!role || !email) {
      return new Response(JSON.stringify({ error: 'Role and email are required' }), { status: 400 });
    }

    const table = role === 'supplier' ? 'suppliers' : 'users';
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Email not found' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({ message: 'Email verified successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Server error', details: err.message }),
      { status: 500 }
    );
  }
}


// import db from '@/lib/db';

// export async function POST(req) {
//   try {
//     const { role, email } = await req.json();

//     if (!role || !email) {
//       return new Response(JSON.stringify({ error: 'Role and email are required' }), { status: 400 });
//     }

//     const table = role === 'supplier' ? 'suppliers' : 'users';
//     const [rows] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);

//     if (rows.length === 0) {
//       return new Response(JSON.stringify({ error: 'Email not found' }), { status: 404 });
//     }

//     return new Response(
//       JSON.stringify({ message: 'Email verified successfully' }),
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
