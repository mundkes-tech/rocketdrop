'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isLoggedIn, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return; // Wait for AuthContext to load

    // 🔒 If user not logged in → store redirect and go to login
    if (!isLoggedIn) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.replace('/login');
      return;
    }

    // 🔒 Role mismatch → send to correct dashboard
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      if (user.role === 'supplier') router.replace('/supplier-dashboard');
      else if (user.role === 'user') router.replace('/user-dashboard');
      else router.replace('/');
    }
  }, [isInitialized, isLoggedIn, user?.role, allowedRoles, router]);

  // 🌀 Wait until AuthContext initializes
  if (!isInitialized) return <LoadingSpinner />;

  // 🚪 Hide content for guests while redirecting
  if (!isLoggedIn) return null;

  // ✅ Authorized → show the content
  return <>{children}</>;
}
