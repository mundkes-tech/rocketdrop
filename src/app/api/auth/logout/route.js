// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { expireCookie } from '@/lib/jwt';

/**
 * POST /api/auth/logout
 * Clear authentication cookies and logout user
 */
export async function POST(request) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Expire both access and refresh tokens
    response.headers.append('Set-Cookie', expireCookie('accessToken'));
    response.headers.append('Set-Cookie', expireCookie('refreshToken'));

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
