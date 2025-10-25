import db from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!role || (!id && !email)) {
      return new Response(
        JSON.stringify({ error: 'Role and id or email required' }),
        { status: 400 }
      );
    }

    const table = role === 'supplier' ? 'suppliers' : 'users';
    const condition = id ? 'id = ?' : 'email = ?';
    const value = id || email;

    const [rows] = await db.query(`SELECT * FROM ${table} WHERE ${condition}`, [value]);

    if (rows.length === 0)
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404 });

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Server error', details: err.message }),
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const { id, email, role, password, ...data } = await req.json();

    if (!role || (!id && !email)) {
      return new Response(
        JSON.stringify({ error: 'Role and id or email required' }),
        { status: 400 }
      );
    }

    const table = role === 'supplier' ? 'suppliers' : 'users';

    // If password is being updated, hash it
    let updatedFields = { ...data };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }

    // Build dynamic query
    const columns = Object.keys(updatedFields);
    const values = Object.values(updatedFields);

    if (columns.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No fields to update' }),
        { status: 400 }
      );
    }

    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const condition = id ? 'id = ?' : 'email = ?';
    const identifier = id || email;

    await db.query(`UPDATE ${table} SET ${setClause} WHERE ${condition}`, [
      ...values,
      identifier,
    ]);

    return new Response(
      JSON.stringify({ message: 'Profile updated successfully' }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Server error', details: err.message }),
      { status: 500 }
    );
  }
}
