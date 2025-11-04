'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user) {
      router.replace('/login');
    } else if (user.role === 'user') {
      router.replace('/user-dashboard');
    } else if (user.role === 'supplier') {
      router.replace('/supplier-dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null;
}
