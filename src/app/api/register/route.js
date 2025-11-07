import db from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { role, ...data } = await req.json();

    if (!role) {
      return new Response(JSON.stringify({ error: 'Role is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    if (role === 'user') {
      const { name, email, phone, address } = data;

      // Check if user already exists
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400 });
      }

      await db.query(
        'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone, address]
      );

      return new Response(
        JSON.stringify({ message: 'User registered successfully', role: 'user' }),
        { status: 201 }
      );
    }

    if (role === 'supplier') {
      const { company_name, email, phone, address, gst_number } = data;

      // Check if supplier already exists
      const [existing] = await db.query('SELECT id FROM suppliers WHERE email = ?', [email]);
      if (existing.length > 0) {
        return new Response(JSON.stringify({ error: 'Supplier already exists' }), { status: 400 });
      }

      await db.query(
        'INSERT INTO suppliers (company_name, email, password, phone, address, gst_number) VALUES (?, ?, ?, ?, ?, ?)',
        [company_name, email, hashedPassword, phone, address, gst_number]
      );

      return new Response(
        JSON.stringify({ message: 'Supplier registered successfully', role: 'supplier' }),
        { status: 201 }
      );
    }

    return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Server error', details: err.message }),
      { status: 500 }
    );
  }
}


// import db from '@/lib/db';
// import bcrypt from 'bcrypt';

// export async function POST(req) {
//   try {
//     const { role, ...data } = await req.json();

//     if (!role) {
//       return new Response(JSON.stringify({ error: 'Role is required' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const hashedPassword = await bcrypt.hash(data.password, 10);

//     if (role === 'user') {
//       const { name, email, phone, address } = data;

//       // Check if user already exists
//       const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
//       if (existing.length > 0) {
//         return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400 });
//       }

//       await db.query(
//         'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
//         [name, email, hashedPassword, phone, address]
//       );

//       return new Response(
//         JSON.stringify({ message: 'User registered successfully', role: 'user' }),
//         { status: 201 }
//       );
//     }

//     if (role === 'supplier') {
//       const { company_name, email, phone, address, gst_number } = data;

//       // Check if supplier already exists
//       const [existing] = await db.query('SELECT id FROM suppliers WHERE email = ?', [email]);
//       if (existing.length > 0) {
//         return new Response(JSON.stringify({ error: 'Supplier already exists' }), { status: 400 });
//       }

//       await db.query(
//         'INSERT INTO suppliers (company_name, email, password, phone, address, gst_number) VALUES (?, ?, ?, ?, ?, ?)',
//         [company_name, email, hashedPassword, phone, address, gst_number]
//       );

//       return new Response(
//         JSON.stringify({ message: 'Supplier registered successfully', role: 'supplier' }),
//         { status: 201 }
//       );
//     }

//     return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400 });
//   } catch (err) {
//     console.error(err);
//     return new Response(
//       JSON.stringify({ error: 'Server error', details: err.message }),
//       { status: 500 }
//     );
//   }
// }
