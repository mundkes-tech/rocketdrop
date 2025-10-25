'use client';

import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import SupplierNavbar from '@/components/supplier/navbar';

export default function SupplierDashboardLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['supplier']}>
      <div className="flex h-screen bg-[#F7F9FB]">
        <SupplierNavbar /> {/* ✅ Use extracted component */}
        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
