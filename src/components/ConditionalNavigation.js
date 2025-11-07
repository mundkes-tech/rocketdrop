'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { Navigation } from '@/components/navbar';
import { Loader2 } from 'lucide-react';

export default function ConditionalNavigation() {
  const { user, isLoggedIn, loading } = useAuth();

  // 🌀 Show spinner while auth state is resolving
  if (loading) {
    return (
      <div className="w-full flex justify-center py-4 bg-gray-50">
        <Loader2 className="h-5 w-5 text-[#004a7c] animate-spin" />
      </div>
    );
  }

  // 🚫 Not logged in → no navbar
  if (!isLoggedIn) return null;

  // 👤 Render navbar for user role only
  if (user?.role === 'user') {
    return <Navigation />;
  }

  // 🧾 Future-ready (can handle admin/supplier/etc.)
  return null;
}


// // src/components/ConditionalNavigation.js
// 'use client';

// import { useAuth } from '@/app/contexts/AuthContext';
// import { Navigation } from '@/components/navbar';

// export default function ConditionalNavigation() {
//   const { user, isLoggedIn } = useAuth();

//   if (!isLoggedIn) return null; // loading spinner

//   // Only render user navbar
//   if (user.role === 'user') return <Navigation />;

//   // Suppliers get nothing here
//   return null;
// }
