// src/lib/jwt.js
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

const JWT_ACCESS_EXPIRY = '1h'; // 1 hour
const JWT_REFRESH_EXPIRY = '7d'; // 7 days

/**
 * Generate Access Token (short-lived)
 * @param {Object} payload - User data { id, email, role }
 * @returns {Promise<string>} JWT token
 */
export async function generateAccessToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_ACCESS_EXPIRY)
      .setSubject(payload.id.toString())
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Token generation failed');
  }
}

/**
 * Generate Refresh Token (long-lived)
 * @param {Object} payload - User data { id, email, role }
 * @returns {Promise<string>} JWT token
 */
export async function generateRefreshToken(payload) {
  try {
    const token = await new SignJWT({ id: payload.id, email: payload.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_REFRESH_EXPIRY)
      .setSubject(payload.id.toString())
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Token generation failed');
  }
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} Decoded payload
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    // Token expired or invalid
    return null;
  }
}

/**
 * Extract token from Authorization header or cookies
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null
 */
export function extractToken(request) {
  // Try Authorization header first (for API calls)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookies (for SSR/middleware)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );
    return cookies.accessToken || null;
  }

  return null;
}

/**
 * Create secure HTTP-only cookie string
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} maxAge - Max age in seconds
 * @returns {string} Set-Cookie header value
 */
export function createSecureCookie(name, value, maxAge) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return [
    `${name}=${value}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    isProduction ? 'Secure' : '', // HTTPS only in production
  ]
    .filter(Boolean)
    .join('; ');
}

/**
 * Create cookie string to delete/expire a cookie
 * @param {string} name - Cookie name
 * @returns {string} Set-Cookie header value
 */
export function expireCookie(name) {
  return `${name}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`;
}
