'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Package, BarChart2, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function SupplierNavbar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Overview', href: '/supplier-dashboard', icon: BarChart2 },
    { name: 'Products', href: '/supplier-dashboard/products', icon: Package },
    { name: 'Orders', href: '/supplier-dashboard/orders', icon: ShoppingCart },
    { name: 'Analytics', href: '/supplier-dashboard/analytics', icon: BarChart2 },
    { name: 'Profile', href: '/supplier-dashboard/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#004a7c] text-white flex flex-col p-6">
      <h2 className="text-2xl font-bold mb-8 text-center tracking-wide">RocketDrop</h2>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ name, href, icon: Icon }) => (
          <Link
            key={name}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              pathname === href
                ? 'bg-[#D7C6BC] text-[#004a7c] font-semibold'
                : 'hover:bg-[#005691]'
            }`}
          >
            <Icon size={20} />
            {name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-[#005691] hover:bg-[#003f63] transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
