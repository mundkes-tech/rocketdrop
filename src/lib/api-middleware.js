// src/lib/api-middleware.js
import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from './jwt';

/**
 * Standard API response helper
 */
export function sendResponse(success, message, data = null, status = 200) {
  return NextResponse.json({ success, message, data }, { status });
}

/**
 * Middleware to require authentication
 * Extracts and verifies JWT token, attaches user to request
 * 
 * Usage:
 * export async function GET(req) {
 *   return requireAuth(req, async (req, user) => {
 *     // Your protected route logic here
 *     return NextResponse.json({ user });
 *   });
 * }
 */
export async function requireAuth(request, handler) {
  try {
    // Extract token from request
    const token = extractToken(request);
    
    if (!token) {
      return sendResponse(false, 'Authentication required. Please login.', null, 401);
    }

    // Verify token
    const payload = await verifyToken(token);
    
    if (!payload) {
      return sendResponse(false, 'Invalid or expired token. Please login again.', null, 401);
    }

    // Attach user info to request for handler
    const user = {
      id: parseInt(payload.id) || parseInt(payload.sub),
      email: payload.email,
      role: payload.role,
    };

    // Call the actual handler with user context
    return await handler(request, user);
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendResponse(false, 'Authentication failed.', null, 401);
  }
}

/**
 * Middleware to require admin role
 * First checks authentication, then verifies admin role
 * 
 * Usage:
 * export async function DELETE(req) {
 *   return requireAdmin(req, async (req, user) => {
 *     // Admin-only logic here
 *   });
 * }
 */
export async function requireAdmin(request, handler) {
  return requireAuth(request, async (req, user) => {
    // Check if user has admin role
    if (user.role !== 'admin') {
      return sendResponse(
        false, 
        'Access denied. Admin privileges required.', 
        null, 
        403
      );
    }

    // User is admin, proceed with handler
    return await handler(req, user);
  });
}

/**
 * Middleware to verify user can only access their own resources
 * Checks if requested userId matches authenticated user's id
 * 
 * Usage:
 * export async function GET(req) {
 *   const { searchParams } = new URL(req.url);
 *   const userId = searchParams.get('userId');
 *   
 *   return requireOwnership(req, userId, async (req, user) => {
 *     // User can only access their own data
 *   });
 * }
 */
export async function requireOwnership(request, resourceUserId, handler) {
  return requireAuth(request, async (req, user) => {
    // Admin can access any resource
    if (user.role === 'admin') {
      return await handler(req, user);
    }

    // Regular user must match resource owner
    const requestedUserId = parseInt(resourceUserId);
    if (user.id !== requestedUserId) {
      return sendResponse(
        false,
        'Access denied. You can only access your own resources.',
        null,
        403
      );
    }

    return await handler(req, user);
  });
}

/**
 * Optional auth - doesn't fail if no token, but attaches user if present
 * Useful for endpoints that work for both guests and logged-in users
 * 
 * Usage:
 * export async function GET(req) {
 *   return optionalAuth(req, async (req, user) => {
 *     // user will be null for guests, populated for logged-in users
 *     if (user) {
 *       // Show personalized content
 *     }
 *   });
 * }
 */
export async function optionalAuth(request, handler) {
  try {
    const token = extractToken(request);
    
    if (!token) {
      // No token, proceed as guest
      return await handler(request, null);
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      // Invalid token, proceed as guest
      return await handler(request, null);
    }

    const user = {
      id: parseInt(payload.id) || parseInt(payload.sub),
      email: payload.email,
      role: payload.role,
    };

    return await handler(request, user);
    
  } catch (error) {
    // On error, proceed as guest
    return await handler(request, null);
  }
}
