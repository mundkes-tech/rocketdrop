'use client';

import { Navigation } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthProvider } from '@/app/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function RootLayoutClient({ children }) {
  return (
    <AuthProvider>
      <Navigation />
      <ProtectedRoute allowedRoles={['user']}>
        {children}
      </ProtectedRoute>
      <Footer />
    </AuthProvider>
  );
}
