'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import MyOrdersPageContent from './MyOrdersPageContent';

export default function MyOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <MyOrdersPageContent />
    </ProtectedRoute>
  );
}