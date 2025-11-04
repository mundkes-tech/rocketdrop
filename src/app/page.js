'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (user) {
      if (user.role === 'user') router.replace('/user-dashboard');
      else if (user.role === 'supplier') router.replace('/supplier-dashboard');
    } else {
      setCheckingUser(false); // no user, show homepage
    }
  }, [router]);

  if (checkingUser) {
    // Show blank or loader while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  // Normal homepage if not logged in
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
      <h1 className="text-4xl font-bold text-[#004a7c] mb-4">Welcome to RocketDrop 🚀</h1>
      <p className="text-gray-600 max-w-md mb-6">
        Connect suppliers and users directly to save cost, boost efficiency, and enjoy smooth commerce.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2 bg-[#004a7c] text-white rounded-lg hover:bg-[#00325a] transition"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-6 py-2 border border-[#004a7c] text-[#004a7c] rounded-lg hover:bg-[#004a7c] hover:text-white transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
