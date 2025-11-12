'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import ProfilePageContent from './profilepagecontent';

export default function ProfilePage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
