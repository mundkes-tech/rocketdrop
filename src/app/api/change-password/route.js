import db from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { role, email, newPassword } = await req.json();

    if (!role || !email || !newPassword) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const table = role === 'supplier' ? 'suppliers' : 'users';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await db.query(
      `UPDATE ${table} SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: 'Email not found' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({ message: 'Password updated successfully' }),
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
