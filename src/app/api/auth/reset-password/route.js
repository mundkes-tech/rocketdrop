// src/app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
export async function POST(req) {
  try {
    const { token, email, newPassword } = await req.json();

    // Validate inputs
    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash the token to match database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const [tokens] = await db.query(
      `SELECT prt.*, u.id as user_id, u.email 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token_hash = ? 
       AND u.email = ?
       AND prt.expires_at > NOW()
       AND prt.used_at IS NULL
       LIMIT 1`,
      [tokenHash, email]
    );

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const tokenData = tokens[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, tokenData.user_id]
    );

    // Mark token as used
    await db.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?',
      [tokenData.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
