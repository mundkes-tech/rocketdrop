'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/');
    }
  }, [isLoggedIn, user, allowedRoles, router]);

  if (!isLoggedIn) return null;
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
//       // Not logged in → go to login
//       router.replace('/login');
//     } else if (allowedRoles && !allowedRoles.includes(user.role)) {
//       // Logged in but role mismatch → go to home
//       router.replace('/');
//     }
//   }, [isLoggedIn, user, allowedRoles, router]);

//   if (!isLoggedIn) return null; // Optional: loading spinner

//   return <>{children}</>;
// }
