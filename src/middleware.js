// src/middleware.js
import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

/**
 * Next.js Middleware - Runs before every request
 * Validates JWT tokens and protects routes
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // --- Public routes (no auth required) ---
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/about',
    '/products',
    '/forgot-password',
    '/reset-password',
  ];

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // --- Public API routes ---
  const publicApiRoutes = [
    '/api/login',
    '/api/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/forgot-password',
    '/api/products', // Public product browsing (GET only)
    '/api/categories',
    '/api/auth/refresh',
  ];

  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // --- Protected routes requiring authentication ---
  const protectedRoutes = [
    '/user-dashboard',
    '/profile',
    '/cart',
    '/checkout',
    '/myorders',
    '/admin',
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    // Extract token from cookies or Authorization header
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // No token - redirect to login
      const loginUrl = pathname.startsWith('/admin') 
        ? new URL('/login', request.url)
        : new URL('/login', request.url);
      
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token
    const payload = await verifyToken(token);

    if (!payload) {
      // Invalid/expired token - clear cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    // Admin route access control
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      // Non-admin trying to access admin routes
      return NextResponse.redirect(new URL('/user-dashboard', request.url));
    }

    // User route access control (prevent admin from accessing user routes)
    if (pathname.startsWith('/user-dashboard') && payload.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/admin-dashboard', request.url));
    }
  }

  // --- API route protection ---
  // Admin API routes
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('accessToken')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

/**
 * Configure which routes this middleware runs on
 * Excludes static files and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|images|lottie).*)',
  ],
};
