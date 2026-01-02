// src/app/api/auth/forgot-password/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

/**
 * POST /api/auth/forgot-password
 * Generate password reset token and send email
 */
export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [users] = await db.query(
      'SELECT id, name, email FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    // Always return success (security: don't reveal if email exists)
    // But only send email if user actually exists
    if (users && users.length > 0) {
      const user = users[0];

      // Generate reset token (secure random string)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Token expires in 1 hour
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Store token in database
      await db.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, created_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         token_hash = VALUES(token_hash),
         expires_at = VALUES(expires_at),
         created_at = NOW()`,
        [user.id, resetTokenHash, expiresAt]
      );

      // Send reset email
      const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      await sendPasswordResetEmail({
        user_email: email,
        user_name: user.name,
        reset_url: resetUrl,
      });
    }

    // Always return success (security best practice)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    );
  }
}
