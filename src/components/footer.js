'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">RocketDrop</h3>
            <p className="text-gray-400 mb-4">
              Premium tech products with fast delivery and exceptional customer service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white cursor-pointer">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white cursor-pointer">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white cursor-pointer">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white cursor-pointer">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white">Products</Link></li>
              <li><Link href="/cart" className="text-gray-400 hover:text-white">Cart</Link></li>
              <li><Link href="/account" className="text-gray-400 hover:text-white">My Account</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">FAQs</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Shipping Policy</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white">Returns & Refunds</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to receive updates on new products and special promotions.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 w-full rounded-l-md focus:outline-none text-gray-900"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© {currentYear} RocketDrop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


// 'use client';

// import Link from 'next/link';
// import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

// export function Footer() {
//   const currentYear = new Date().getFullYear();
  
//   return (
//     <footer className="bg-gray-900 text-white">
//       <div className="container mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {/* Company Info */}
//           <div>
//             <h3 className="text-lg font-bold mb-4">RocketDrop</h3>
//             <p className="text-gray-400 mb-4">
//               Premium tech products with fast delivery and exceptional customer service.
//             </p>
//             <div className="flex space-x-4">
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <Facebook className="h-5 w-5" />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <Twitter className="h-5 w-5" />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <Instagram className="h-5 w-5" />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <Github className="h-5 w-5" />
//               </a>
//             </div>
//           </div>
          
//           {/* Quick Links */}
//           <div>
//             <h3 className="text-lg font-bold mb-4">Quick Links</h3>
//             <ul className="space-y-2">
//               <li>
//                 <Link href="/" className="text-gray-400 hover:text-white">
//                   Home
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/products" className="text-gray-400 hover:text-white">
//                   Products
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/cart" className="text-gray-400 hover:text-white">
//                   Cart
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/account" className="text-gray-400 hover:text-white">
//                   My Account
//                 </Link>
//               </li>
//             </ul>
//           </div>
          
//           {/* Customer Service */}
//           <div>
//             <h3 className="text-lg font-bold mb-4">Customer Service</h3>
//             <ul className="space-y-2">
//               <li>
//                 <Link href="#" className="text-gray-400 hover:text-white">
//                   Contact Us
//                 </Link>
//               </li>
//               <li>
//                 <Link href="#" className="text-gray-400 hover:text-white">
//                   FAQs
//                 </Link>
//               </li>
//               <li>
//                 <Link href="#" className="text-gray-400 hover:text-white">
//                   Shipping Policy
//                 </Link>
//               </li>
//               <li>
//                 <Link href="#" className="text-gray-400 hover:text-white">
//                   Returns & Refunds
//                 </Link>
//               </li>
//             </ul>
//           </div>
          
//           {/* Newsletter */}
//           <div>
//             <h3 className="text-lg font-bold mb-4">Newsletter</h3>
//             <p className="text-gray-400 mb-4">
//               Subscribe to receive updates on new products and special promotions.
//             </p>
//             <form className="flex">
//               <input
//                 type="email"
//                 placeholder="Your email"
//                 className="px-4 py-2 w-full rounded-l-md focus:outline-none text-gray-900"
//               />
//               <button
//                 type="submit"
//                 className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md"
//               >
//                 Subscribe
//               </button>
//             </form>
//           </div>
//         </div>
        
//         <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
//           <p>© {currentYear} RocketDrop. All rights reserved.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }