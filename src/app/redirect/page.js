'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user || !user.role) {
        router.replace('/login');
      } else if (user.role === 'user') {
        router.replace('/user-dashboard');
      } else if (user.role === 'admin') {
        router.replace('/login');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error reading user data:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return null;
}
