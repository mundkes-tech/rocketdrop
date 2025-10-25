import db from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    // Basic validation
    if (!email || !password || !role) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and role are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Define role-based table name
    const table = role === 'supplier' ? 'suppliers' : 'users';

    // Fetch user/supplier from correct table
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = rows[0];

    // Check password (only if password column exists)
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // ✅ Log role info in server console
    console.log(`🟢 ${role.toUpperCase()} logged in: ${email}`);

    // Prepare user info to return (without password)
    const userInfo = {
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: role,
      address: user.address || '',
    };

    // Define redirect based on role
    const redirect =
      role === 'supplier' ? '/supplier-dashboard' : '/';

    return new Response(
      JSON.stringify({
        message: 'Login successful',
        user: userInfo,
        role,
        redirect,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


