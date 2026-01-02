'use client';

import { Footer } from '@/components/footer';
import { usePathname } from 'next/navigation';

export default function ConditionalFooter() {
  const pathname = usePathname() || '/'; // fallback for undefined path

  // 🚫 Pages where footer should NOT appear
  const hiddenRoutes = [
    '/admin', // admin routes
  ];

  // normalize path
  const normalizedPath = pathname.replace(/\/$/, '') || '/';

  // check match
  const hideFooter = hiddenRoutes.some(
    (route) => normalizedPath === route || normalizedPath.startsWith(`${route}/`)
  );

  if (hideFooter) return null; // hide footer on admin pages

  // ✅ Show footer for all other pages
  return <Footer />;
}