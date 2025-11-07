'use client';

import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import SupplierNavbar from '@/components/supplier/navbar';

export default function SupplierDashboardLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['supplier']}>
      <div className="flex min-h-screen bg-[#F7F9FB] overflow-hidden">
        {/* Sidebar Navigation */}
        <SupplierNavbar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 scrollbar-thin scrollbar-thumb-[#004a7c]/40 scrollbar-track-gray-100">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}


// 'use client';

// import { motion } from 'framer-motion';
// import ProtectedRoute from '@/components/ProtectedRoute';
// import SupplierNavbar from '@/components/supplier/navbar';

// export default function SupplierDashboardLayout({ children }) {
//   return (
//     <ProtectedRoute allowedRoles={['supplier']}>
//       <div className="flex h-screen bg-[#F7F9FB]">
//         <SupplierNavbar /> {/* ✅ Use extracted component */}
//         <main className="flex-1 p-8 overflow-y-auto">
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="h-full"
//           >
//             {children}
//           </motion.div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );
// }
