// src/app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';
import { verifyToken, generateAccessToken, createSecureCookie, expireCookie } from '@/lib/jwt';
import db from '@/lib/db';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken);

    if (!payload) {
      // Refresh token expired or invalid - clear cookies
      const response = NextResponse.json(
        { success: false, message: 'Refresh token expired. Please login again.' },
        { status: 401 }
      );
      
      response.headers.set('Set-Cookie', [
        expireCookie('accessToken'),
        expireCookie('refreshToken'),
      ].join(', '));

      return response;
    }

    // Fetch latest user data from database
    const userId = parseInt(payload.id) || parseInt(payload.sub);
    const [users] = await db.query(
      'SELECT id, email, name FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    // Check if user still exists and is active
    if (!users || users.length === 0) {
      // User deleted - invalidate session
      const response = NextResponse.json(
        { success: false, message: 'User not found. Please login again.' },
        { status: 401 }
      );
      
      response.headers.set('Set-Cookie', [
        expireCookie('accessToken'),
        expireCookie('refreshToken'),
      ].join(', '));

      return response;
    }

    const user = users[0];

    // Use role from JWT payload (already verified), or check if admin still exists
    let role = payload.role || 'user';
    if (role === 'admin') {
      // Verify admin still exists in admins table
      const [admins] = await db.query(
        'SELECT id FROM admins WHERE email = ? LIMIT 1',
        [user.email]
      );
      
      if (admins && admins.length > 0) {
        role = 'admin';
      }
    }

    // Generate new access token with latest user data
    const newAccessToken = await generateAccessToken({
      id: user.id,
      email: user.email,
      role: role,
      name: user.name,
    });

    // Set new access token in cookie (refresh token stays the same)
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: role,
        },
      },
    });

    // Set new access token cookie (1 hour)
    response.headers.set('Set-Cookie', createSecureCookie('accessToken', newAccessToken, 3600));

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
