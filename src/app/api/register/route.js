import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, createSecureCookie } from '@/lib/jwt';

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
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, address]
    );

    // Prepare user data for JWT
    const userInfo = {
      id: result.insertId,
      name,
      email,
      role: 'user',
    };

    // Generate JWT tokens
    const accessToken = await generateAccessToken(userInfo);
    const refreshToken = await generateRefreshToken(userInfo);

    // Create response with tokens
    const response = new Response(
      JSON.stringify({ 
        message: 'User registered successfully', 
        role: 'user',
        user: userInfo,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

    // Set secure cookies
    response.headers.append('Set-Cookie', createSecureCookie('accessToken', accessToken, 3600)); // 1 hour
    response.headers.append('Set-Cookie', createSecureCookie('refreshToken', refreshToken, 604800)); // 7 days

    return response;

  } catch (err) {
    console.error('❌ Registration Error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error', details: err.message }),
      { status: 500 }
    );
  }
}