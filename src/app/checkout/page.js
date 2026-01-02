'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import CheckoutPageContent from './CheckoutPageContent';

export default function CheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <CheckoutPageContent />
    </ProtectedRoute>
  );
}
