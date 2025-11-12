'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { Navigation } from '@/components/navbar';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ConditionalNavigation() {
  const { user, isInitialized } = useAuth();
  const pathname = usePathname() || '/'; // fallback for undefined path

  // 🌀 Show loader while auth initializes
  if (!isInitialized) {
    return (
      <div className="w-full flex justify-center py-4 bg-gray-50">
        <Loader2 className="h-5 w-5 text-[#004a7c] animate-spin" />
      </div>
    );
  }

  // 🚫 Pages where navbar should NOT appear
  const hiddenRoutes = [
    '/', // homepage
    '/login',
    '/register',
    '/supplier-dashboard',
    '/supplier-login',
    '/supplier-register',
  ];

  // normalize path
  const normalizedPath = pathname.replace(/\/$/, '') || '/';

  // check match
  const hideNavbar = hiddenRoutes.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(`${route}/`)
  );

  if (hideNavbar) return null; // hide navbar on homepage/login/etc.
  if (user?.role === 'supplier') return null; // supplier has its own layout

  // ✅ Show navbar for user or guest
  return <Navigation />;
}




// 'use client';

// import { useAuth } from '@/app/contexts/AuthContext';
// import { Navigation } from '@/components/navbar';
// import { Loader2 } from 'lucide-react';

// export default function ConditionalNavigation() {
//   const { user, isLoggedIn, loading } = useAuth();

//   // 🌀 Show spinner while auth state is resolving
//   if (loading) {
//     return (
//       <div className="w-full flex justify-center py-4 bg-gray-50">
//         <Loader2 className="h-5 w-5 text-[#004a7c] animate-spin" />
//       </div>
//     );
//   }

//   // 🚫 Not logged in → no navbar
//   if (!isLoggedIn) return null;

//   // 👤 Render navbar for user role only
//   if (user?.role === 'user') {
//     return <Navigation />;
//   }

//   // 🧾 Future-ready (can handle admin/supplier/etc.)
//   return null;
// }
