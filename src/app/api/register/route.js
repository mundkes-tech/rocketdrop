import db from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { role, ...data } = await req.json();

    // Role must be user ONLY
    if (!role || role !== 'user') {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Only user registration is allowed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, phone, address, password } = data;

    // Validate required fields
    if (!name || !email || !password || !phone || !address) {
      return new Response(
        JSON.stringify({ error: 'All fields are required.' }),
        { status: 400 }
      );
    }

    // Check if user exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: 'User already exists.' }),
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.query(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, address]
    );

    return new Response(
      JSON.stringify({ message: 'User registered successfully', role: 'user' }),
      { status: 201 }
    );
  } catch (err) {
    console.error('❌ Registration Error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error', details: err.message }),
      { status: 500 }
    );
  }
}