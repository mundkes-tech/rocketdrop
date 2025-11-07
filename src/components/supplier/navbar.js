'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Package, BarChart2, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useState } from 'react';

export default function SupplierNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Overview', href: '/supplier-dashboard', icon: BarChart2 },
    { name: 'Products', href: '/supplier-dashboard/products', icon: Package },
    { name: 'Orders', href: '/supplier-dashboard/orders', icon: ShoppingCart },
    { name: 'Analytics', href: '/supplier-dashboard/analytics', icon: BarChart2 },
    { name: 'Profile', href: '/supplier-dashboard/profile', icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    logout();
    router.replace('/login');
  };

  return (
    <>
      {/* ✅ Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#004a7c] p-2 rounded-md text-white shadow-md hover:bg-[#005b94] transition"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* ✅ Sidebar (Fixed Height + Full Layout) */}
        <aside
          className={`fixed lg:relative top-0 left-0 min-h-screen w-64 md:w-72 lg:w-80 bg-gradient-to-b from-[#004a7c] to-[#002f4c] text-white flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out shadow-xl z-40 ${
            isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >

        {/* Header */}
        <div>
          <h2 className="text-2xl font-extrabold mb-10 text-center tracking-wide text-[#D7C6BC]">
            RocketDrop
          </h2>

          {/* Nav Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map(({ name, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={name}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-5 rounded-xl transition-all duration-300 ${
                    active
                      ? 'bg-[#D7C6BC] text-[#004a7c] font-semibold shadow-md'
                      : 'hover:bg-[#005b94] hover:shadow-sm'
                  }`}
                >
                  <Icon size={20} />
                  <span>{name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

      <div className="pt-8 border-t border-white/20 pb-8">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#005b94] hover:bg-[#003f63] transition-all duration-300 font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>

      {/* ✅ Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
}



// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { LogOut, Package, BarChart2, ShoppingCart, User } from 'lucide-react';
// import { useAuth } from '@/app/contexts/AuthContext';

// export default function SupplierNavbar() {
//   const pathname = usePathname();
//   const { logout } = useAuth();

//   const navItems = [
//     { name: 'Overview', href: '/supplier-dashboard', icon: BarChart2 },
//     { name: 'Products', href: '/supplier-dashboard/products', icon: Package },
//     { name: 'Orders', href: '/supplier-dashboard/orders', icon: ShoppingCart },
//     { name: 'Analytics', href: '/supplier-dashboard/analytics', icon: BarChart2 },
//     { name: 'Profile', href: '/supplier-dashboard/profile', icon: User },
//   ];

//   return (
//     <aside className="w-64 bg-[#004a7c] text-white flex flex-col p-6">
//       <h2 className="text-2xl font-bold mb-8 text-center tracking-wide">RocketDrop</h2>

//       <nav className="flex flex-col gap-2">
//         {navItems.map(({ name, href, icon: Icon }) => (
//           <Link
//             key={name}
//             href={href}
//             className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
//               pathname === href
//                 ? 'bg-[#D7C6BC] text-[#004a7c] font-semibold'
//                 : 'hover:bg-[#005691]'
//             }`}
//           >
//             <Icon size={20} />
//             {name}
//           </Link>
//         ))}
//       </nav>

//       <div className="mt-auto pt-8">
//         <button
//           onClick={logout}
//           className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-[#005691] hover:bg-[#003f63] transition"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// }
