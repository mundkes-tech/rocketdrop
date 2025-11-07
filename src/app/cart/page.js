'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/button';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Load cart asynchronously from localStorage
  useEffect(() => {
    setTimeout(() => {
      const userCartKey = Object.keys(localStorage).find((key) =>
        key.startsWith('cart_')
      );
      if (userCartKey) {
        const savedCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
        setCart(savedCart);
      }
      setLoading(false);
    }, 0);
  }, []);

  // 🧾 Update localStorage whenever cart changes
  const updateCart = useCallback((updated) => {
    setCart(updated);
    const userCartKey = Object.keys(localStorage).find((key) =>
      key.startsWith('cart_')
    );
    if (userCartKey) {
      localStorage.setItem(userCartKey, JSON.stringify(updated));
    }
  }, []);

  const removeItem = useCallback(
    (id) => updateCart(cart.filter((item) => item.id !== id)),
    [cart, updateCart]
  );

  const clearCart = useCallback(() => updateCart([]), [updateCart]);

  const changeQuantity = useCallback(
    (id, delta) => {
      const updated = cart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      updateCart(updated);

      // ✨ Smooth scroll to item for better feedback
      window.requestAnimationFrame(() => {
        const el = document.querySelector(`#cart-item-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    },
    [cart, updateCart]
  );

  // 🧮 Compute subtotal efficiently
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#001F54] to-[#034078] text-white px-4 py-12 md:px-12">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400"
        >
          Your Cart
        </motion.h1>

        {loading ? (
          <div className="text-center py-32 animate-pulse text-blue-200">
            Loading your cart...
          </div>
        ) : cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* 🛒 Cart Items */}
            <div className="md:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/10">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    id={`cart-item-${item.id}`}
                    layout="position"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between py-4 border-b border-white/10 last:border-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 relative rounded-xl overflow-hidden shadow-lg">
                        <Image
                          src={item.imageUrl || '/placeholder.png'}
                          alt={item.name}
                          fill
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="/placeholder.png"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-blue-300">
                          ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-white/20 rounded-lg overflow-hidden">
                        <button
                          onClick={() => changeQuantity(item.id, -1)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-blue-300 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="px-4 font-medium text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => changeQuantity(item.id, 1)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-blue-300 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <p className="w-20 text-right font-semibold text-blue-200">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 🧾 Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/10 h-fit"
            >
              <h2 className="text-xl font-semibold mb-6 text-blue-200">
                Order Summary
              </h2>
              <div className="space-y-3 mb-6 text-blue-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-white border-t border-white/10 pt-3">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition cursor-pointer">
                Proceed to Checkout
              </Button>

              <button
                onClick={clearCart}
                className="w-full mt-4 text-sm text-gray-300 hover:text-red-400 cursor-pointer"
              >
                Clear Cart
              </button>

              <Link
                href="/products"
                className="flex items-center justify-center gap-2 mt-6 text-blue-300 hover:text-blue-100 font-medium cursor-pointer"
              >
                <ArrowLeft size={18} /> Continue Shopping
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// 🧩 Empty Cart Component
function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-32 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10"
    >
      <div className="flex justify-center mb-8">
        <ShoppingBag className="h-16 w-16 text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
      <p className="text-blue-200 mb-8">
        Looks like you haven’t added anything yet. Let’s fix that!
      </p>
      <Link href="/products">
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 transition cursor-pointer">
          Start Shopping
        </Button>
      </Link>
    </motion.div>
  );
}


// 'use client';

// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import Link from 'next/link';
// import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
// import { Button } from '@/components/button';

// export default function CartPage() {
//   const [cart, setCart] = useState([]);

// // 🧠 Load cart from localStorage
// useEffect(() => {
//   // Find the user-specific cart key
//   const userCartKey = Object.keys(localStorage).find((key) =>
//     key.startsWith("cart_")
//   );

//   if (userCartKey) {
//     const savedCart = JSON.parse(localStorage.getItem(userCartKey)) || [];
//     setCart(savedCart);
//   } else {
//     setCart([]);
//   }
// }, []);

// // 🧾 Update localStorage on change
// const updateCart = (updated) => {
//   setCart(updated);
//   const userCartKey = Object.keys(localStorage).find((key) =>
//     key.startsWith("cart_")
//   );
//   if (userCartKey) {
//     localStorage.setItem(userCartKey, JSON.stringify(updated));
//   }
// };


//   const removeItem = (id) => updateCart(cart.filter((item) => item.id !== id));
//   const clearCart = () => updateCart([]);

//   const changeQuantity = (id, delta) => {
//     const updated = cart.map((item) =>
//       item.id === id
//         ? { ...item, quantity: Math.max(1, item.quantity + delta) }
//         : item
//     );
//     updateCart(updated);
//   };

//   const subtotal = cart.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#001F54] to-[#034078] text-white px-4 py-12 md:px-12">
//       <div className="max-w-6xl mx-auto">
//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-4xl font-extrabold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400"
//         >
//           Your Cart
//         </motion.h1>

//         {cart.length === 0 ? (
//           <EmptyCart />
//         ) : (
//           <div className="grid md:grid-cols-3 gap-8">
//             {/* Cart Items */}
//             <div className="md:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/10">
//               <AnimatePresence>
//                 {cart.map((item) => (
//                   <motion.div
//                     key={item.id}
//                     layout
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.9 }}
//                     transition={{ duration: 0.3 }}
//                     className="flex items-center justify-between py-4 border-b border-white/10 last:border-none"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="w-20 h-20 relative rounded-xl overflow-hidden shadow-lg">
//                         <Image
//                         src={item.imageUrl || '/placeholder.png'}
//                         alt={item.name}
//                         fill
//                         className="object-cover group-hover:scale-110 transition-transform duration-500"
//                         />
//                       </div>
//                       <div>
//                         <h3 className="font-semibold text-lg text-white">
//                           {item.name}
//                         </h3>
//                         <p className="text-sm text-blue-300">
//                           ${Number(item.price).toFixed(2)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-4">
//                       <div className="flex items-center border border-white/20 rounded-lg overflow-hidden">
//                         <button
//                           onClick={() => changeQuantity(item.id, -1)}
//                           className="px-3 py-1 bg-white/10 hover:bg-white/20 text-blue-300"
//                         >
//                           −
//                         </button>
//                         <span className="px-4 font-medium text-white">
//                           {item.quantity}
//                         </span>
//                         <button
//                           onClick={() => changeQuantity(item.id, 1)}
//                           className="px-3 py-1 bg-white/10 hover:bg-white/20 text-blue-300"
//                         >
//                           +
//                         </button>
//                       </div>
//                       <p className="w-20 text-right font-semibold text-blue-200">
//                         ${(item.price * item.quantity).toFixed(2)}
//                       </p>
//                       <button
//                         onClick={() => removeItem(item.id)}
//                         className="text-red-400 hover:text-red-500"
//                       >
//                         <Trash2 size={20} />
//                       </button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>

//             {/* Summary Section */}
//             <motion.div
//               initial={{ opacity: 0, x: 30 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2 }}
//               className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/10 h-fit"
//             >
//               <h2 className="text-xl font-semibold mb-6 text-blue-200">
//                 Order Summary
//               </h2>
//               <div className="space-y-3 mb-6 text-blue-100">
//                 <div className="flex justify-between">
//                   <span>Subtotal</span>
//                   <span>${subtotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Shipping</span>
//                   <span>Free</span>
//                 </div>
//                 <div className="flex justify-between text-lg font-semibold text-white border-t border-white/10 pt-3">
//                   <span>Total</span>
//                   <span>${subtotal.toFixed(2)}</span>
//                 </div>
//               </div>

//               <Button className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition">
//                 Proceed to Checkout
//               </Button>

//               <button
//                 onClick={clearCart}
//                 className="w-full mt-4 text-sm text-gray-300 hover:text-red-400"
//               >
//                 Clear Cart
//               </button>

//               <Link
//                 href="/products"
//                 className="flex items-center justify-center gap-2 mt-6 text-blue-300 hover:text-blue-100 font-medium"
//               >
//                 <ArrowLeft size={18} /> Continue Shopping
//               </Link>
//             </motion.div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // 🧩 Empty Cart State
// function EmptyCart() {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 40 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="text-center py-32 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10"
//     >
//       <div className="flex justify-center mb-8">
//         <ShoppingBag className="h-16 w-16 text-blue-400" />
//       </div>
//       <h2 className="text-2xl font-bold text-white mb-3">
//         Your cart is empty
//       </h2>
//       <p className="text-blue-200 mb-8">
//         Looks like you haven’t added anything yet. Let’s fix that!
//       </p>
//       <Link href="/products">
//         <Button className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 transition">
//           Start Shopping
//         </Button>
//       </Link>
//     </motion.div>
//   );
// }
