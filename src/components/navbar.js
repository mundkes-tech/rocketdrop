'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/button';
import SearchBar from '@/components/search-bar';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/contexts/AuthContext';

export function Navigation() {
  const pathname = usePathname();
  const { getItemsCount } = useCart();
  const { user, logout, isLoggedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const cartItemsCount = getItemsCount();
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
    { href: '/deals', label: 'Deals' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/" className="flex items-center z-10">
              <span className="text-2xl font-bold text-blue-600 cursor-pointer select-none">
                RocketDrop
              </span>
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-12">
            {navLinks.map((link) => (
              <motion.div key={link.href} whileHover={{ scale: 1.1 }}>
                <Link
                  href={link.href}
                  className={`text-lg font-semibold ${
                    pathname === link.href ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-5 z-10">
            <div className="w-64">
              <SearchBar placeholder="Search..." />
            </div>

            {/* Show Login or Profile */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Link href={user?.role === 'supplier' ? '/supplier-dashboard/profile' : '/profile'}>
                  <Button variant="ghost" size="icon">
                    <User className="h-6 w-6 text-blue-600" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    logout();            // Clear localStorage/session/etc.
                    router.push('/login'); // Redirect to login page
                  }}
                >
                  <LogOut className="h-6 w-6 text-red-600" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}

            {/* Cart */}
            <motion.div whileHover={{ scale: 1.15 }}>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
