'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (user?.role === 'admin') {
        router.replace('/admin/admin-dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isInitialized, user, router]);

  // Show loading while checking auth
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading Admin Panel...</div>
    </div>
  );
}