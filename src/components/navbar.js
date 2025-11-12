'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartContext } from '@/app/contexts/CartContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/button';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { getItemsCount } = useCartContext();
  const { user, logout, isLoggedIn } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemsCount = getItemsCount();
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/products', label: 'All Products' },
    { href: '/myorders', label: 'My Orders' },
  ];

  // ✅ Handle Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-12">
            {navLinks.map((link) => (
              <motion.div key={link.href} whileHover={{ scale: 1.1 }}>
                <Link
                  href={link.href}
                  className={`text-lg font-semibold transition ${
                    pathname === link.href
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-5 z-10">
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                🔍
              </button>
            </form>

            {/* Auth Buttons */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <Link href={user?.role === 'supplier' ? '/supplier-dashboard/profile' : '/profile'}>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <User className="h-6 w-6 text-blue-600" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer"
                  onClick={() => {
                    localStorage.removeItem('user');
                    router.replace('/login');
                    setTimeout(() => logout(), 50);
                  }}
                >
                  <LogOut className="h-6 w-6 text-red-600" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="cursor-pointer">Login</Button>
              </Link>
            )}

            {/* Cart */}
            <motion.div whileHover={{ scale: 1.15 }}>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative cursor-pointer">
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
          <div className="md:hidden z-20">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="md:hidden bg-white shadow-md rounded-xl mt-2 p-4 space-y-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-lg font-medium ${
                  pathname === link.href ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Search on mobile */}
            <form onSubmit={handleSearch} className="relative mt-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
              />
            </form>
          </motion.div>
        )}
      </div>
    </header>
  );
}


// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
// import { useCart } from '@/hooks/useCart';
// import { Button } from '@/components/button';
// import SearchBar from '@/components/search-bar';
// import { motion } from 'framer-motion';
// import { useAuth } from '@/app/contexts/AuthContext';

// export function Navigation() {
//   const pathname = usePathname();
//   const { getItemsCount } = useCart();
//   const { user, logout, isLoggedIn } = useAuth();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const router = useRouter();
//   const cartItemsCount = getItemsCount();
//   const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

//   const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/about', label: 'About' },
//     { href: '/products', label: 'All Products' },
//     { href: '/myorders', label: 'Myorders' },
//   ];

//   return (
//     <header className="bg-white shadow-sm sticky top-0 z-50">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16 relative">
//           {/* Logo */}
//           <motion.div whileHover={{ scale: 1.05 }}>
//             <Link href="/" className="flex items-center z-10">
//               <span className="text-2xl font-bold text-blue-600 cursor-pointer select-none">
//                 RocketDrop
//               </span>
//             </Link>
//           </motion.div>

//           {/* Navigation Links */}
//           <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-12">
//             {navLinks.map((link) => (
//               <motion.div key={link.href} whileHover={{ scale: 1.1 }}>
//                 <Link
//                   href={link.href}
//                   className={`text-lg font-semibold ${
//                     pathname === link.href ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
//                   }`}
//                 >
//                   {link.label}
//                 </Link>
//               </motion.div>
//             ))}
//           </nav>

//           {/* Right Side */}
//           <div className="hidden md:flex items-center space-x-5 z-10">
//             <div className="w-64">
//               <SearchBar placeholder="Search..." />
//             </div>

//             {/* Show Login or Profile */}
//             {isLoggedIn ? (
//               <div className="flex items-center space-x-3">
//                 <Link href={user?.role === 'supplier' ? '/supplier-dashboard/profile' : '/profile'}>
//                   <Button variant="ghost" size="icon">
//                     <User className="h-6 w-6 text-blue-600" />
//                   </Button>
//                 </Link>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => {
//                     // Immediately redirect before async context updates
//                     localStorage.removeItem("user");
//                     router.replace("/login");
                    
//                     // Then trigger your actual logout logic
//                     setTimeout(() => {
//                       logout();
//                     }, 50);
//                   }}
//                 >
//                   <LogOut className="h-6 w-6 text-red-600" />
//                 </Button>
//               </div>
//             ) : (
//               <Link href="/login">
//                 <Button>Login</Button>
//               </Link>
//             )}

//             {/* Cart */}
//             <motion.div whileHover={{ scale: 1.15 }}>
//               <Link href="/cart">
//                 <Button variant="ghost" size="icon" className="relative">
//                   <ShoppingCart className="h-6 w-6" />
//                   {cartItemsCount > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                       {cartItemsCount}
//                     </span>
//                   )}
//                 </Button>
//               </Link>
//             </motion.div>
//           </div>

//           {/* Mobile Menu Button */}
//           <div className="md:hidden">
//             <button onClick={toggleMobileMenu}>
//               <Menu className="h-6 w-6" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
