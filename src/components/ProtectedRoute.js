'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isLoggedIn, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return; // still initializing

    // 🔒 Not logged in — send to login
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }

    // 🔒 Role mismatch — redirect to their own dashboard
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      if (user.role === 'supplier') router.replace('/supplier-dashboard');
      else if (user.role === 'user') router.replace('/user-dashboard');
      else router.replace('/');
    }
  }, [isInitialized, isLoggedIn, user?.role, allowedRoles.join(','), router]);

  // 🌀 Still initializing auth
  if (!isInitialized) return <LoadingSpinner />;

  // 🚪 Prevent render for unauthorized users
  if (!isLoggedIn) return null;

  // ✅ Render protected content
  return <>{children}</>;
}


// 'use client';

// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { useAuth } from '@/app/contexts/AuthContext';

// export default function ProtectedRoute({ allowedRoles, children }) {
//   const { user, isLoggedIn } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoggedIn) {
//       router.replace('/login');
//     } else if (allowedRoles && !allowedRoles.includes(user.role)) {
//       router.replace('/');
//     }
//   }, [isLoggedIn, user, allowedRoles, router]);

//   if (!isLoggedIn) return null;
//   return <>{children}</>;
// }



