'use client';

import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext'; // 👈 import your auth context

export default function HomePage() {
  const { isLoggedIn, user } = useAuth(); // 👈 this gives us current login info

  // 👇 Decide where "Explore the Platform" should go
  const exploreLink =
    isLoggedIn && user?.role === 'supplier'
      ? '/supplier-dashboard'
      : isLoggedIn && user?.role === 'user'
      ? '/user-dashboard'
      : '/products'; // 👈 guest users go here

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 text-center px-6 py-12">
      <h1 className="text-5xl font-extrabold text-[#004a7c] mb-4">
        Welcome to <span className="text-indigo-600">RocketDrop 🚀</span>
      </h1>

      <p className="text-gray-700 max-w-2xl mb-8 text-lg leading-relaxed">
        The ultimate bridge between <strong>suppliers</strong> and <strong>users</strong>.  
        Discover products, connect directly, and enjoy smarter, faster, and more affordable commerce.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {/* 🔹 Smart Explore Button */}
        <Link
          href='user-dashboard'
          className="px-8 py-3 bg-[#004a7c] text-white rounded-xl font-semibold hover:bg-[#00335a] shadow-lg hover:scale-[1.03] transition-transform"
        >
          Explore the Platform
        </Link>

        {/* 🔹 Login/Register button (for guests) */}
        <Link
          href="/login"
          className="px-8 py-3 border border-[#004a7c] text-[#004a7c] rounded-xl font-semibold hover:bg-[#004a7c] hover:text-white shadow-lg transition-transform hover:scale-[1.03]"
        >
          Login / Register
        </Link>
      </div>

      <p className="mt-12 text-sm text-gray-500">
        Empowering direct trade connections with <strong>RocketDrop</strong>.
      </p>
    </div>
  );
}


// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// export default function HomePage() {
//   const router = useRouter();
//   const [checkingUser, setCheckingUser] = useState(true);

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     const user = userData ? JSON.parse(userData) : null;

//     if (user) {
//       if (user.role === 'user') router.replace('/user-dashboard');
//       else if (user.role === 'supplier') router.replace('/supplier-dashboard');
//     } else {
//       setCheckingUser(false); // no user, show homepage
//     }
//   }, [router]);

//   if (checkingUser) {
//     // Show blank or loader while checking auth
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <p className="text-gray-500 text-lg">Loading...</p>
//       </div>
//     );
//   }

//   // Normal homepage if not logged in
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
//       <h1 className="text-4xl font-bold text-[#004a7c] mb-4">Welcome to RocketDrop 🚀</h1>
//       <p className="text-gray-600 max-w-md mb-6">
//         Connect suppliers and users directly to save cost, boost efficiency, and enjoy smooth commerce.
//       </p>
//       <div className="flex gap-4">
//         <Link
//           href="/login"
//           className="px-6 py-2 bg-[#004a7c] text-white rounded-lg hover:bg-[#00325a] transition"
//         >
//           Login
//         </Link>
//         <Link
//           href="/register"
//           className="px-6 py-2 border border-[#004a7c] text-[#004a7c] rounded-lg hover:bg-[#004a7c] hover:text-white transition"
//         >
//           Register
//         </Link>
//       </div>
//     </div>
//   );
// }
