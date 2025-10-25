// src/components/ConditionalNavigation.js
'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { Navigation } from '@/components/navbar';

export default function ConditionalNavigation() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) return null; // loading spinner

  // Only render user navbar
  if (user.role === 'user') return <Navigation />;

  // Suppliers get nothing here
  return null;
}
