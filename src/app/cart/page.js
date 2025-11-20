'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';

// --- MOCK DEPENDENCIES TO ENSURE COMPILATION ---
// NOTE: In a real Next.js project, you would import these from separate files.
// They are mocked here to make the component runnable as a single file.

// 1. Mock useAuth (replaces '@/contexts/AuthContext')
const MOCK_USER_ID = 'guest_user_123';
const useAuth = () => {
  // Mock returns a user object for simulating logged-in or guest status
  const [user] = useState({ id: MOCK_USER_ID, name: 'Guest' });
  return { user };
};

// 2. Mock useCart (replaces '@/hooks/useCart')
const STORAGE_KEY = 'mock_app_cart';
const INITIAL_MOCK_CART = [
  { id: 'p1', name: 'Cosmic Watch', price: 499.00, quantity: 1, imageUrl: 'https://placehold.co/100x100/1e293b/a5b4fc?text=Watch' },
  { id: 'p2', name: 'Quantum Backpack', price: 99.50, quantity: 2, imageUrl: 'https://placehold.co/100x100/1e293b/a5b4fc?text=Pack' },
  { id: 'p3', name: 'Nebula Sneakers', price: 129.99, quantity: 1, imageUrl: 'https://placehold.co/100x100/1e293b/a5b4fc?text=Shoes' },
];

const useCart = () => {
  // Local storage simulation
  const getCart = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_MOCK_CART;
    } catch (e) {
      console.error("Failed to load cart from storage", e);
      return INITIAL_MOCK_CART;
    }
  }, []);

  const saveCart = useCallback((user, cartData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData));
    } catch (e) {
      console.error("Failed to save cart to storage", e);
    }
  }, []);

  const clearCart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Simulating initial load for demo
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      saveCart(null, INITIAL_MOCK_CART);
    }
  }, [saveCart]);

  return { getCart, saveCart, clearCart };
};

// 3. Mock Link Component (replaces 'next/link')
const MockLink = ({ href, children, className }) => (
    <a href={href} className={className}>
        {children}
    </a>
);

// 4. Mock Image Component Replacement (replaces 'next/image')
// Using standard <img> tag for compatibility.
const ProductImage = ({ src, alt, className }) => (
    <img
        src={src || 'https://placehold.co/100x100/1e293b/a5b4fc?text=Product'}
        alt={alt}
        loading="lazy"
        // Ensure image fills parent container like Next.js Image(fill)
        className={`w-full h-full object-cover ${className}`}
    />
);
// --- END MOCK DEPENDENCIES ---

// --- Empty Cart Component (Styled to Match) ---
function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      className="text-center py-32 px-6 bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/50 border border-slate-700/50 max-w-2xl mx-auto"
    >
      <div className="flex justify-center mb-8">
        <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ yoyo: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
            <ShoppingBag className="h-20 w-20 text-blue-400 drop-shadow-lg" />
        </motion.div>
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">Your Cart is Looking Empty</h2>
      <p className="text-lg text-blue-300 mb-10">
        Looks like you haven&apos;t added anything to your premium selection yet. Let&apos;s find something amazing!
      </p>
      <MockLink href="/products">
        <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-10 py-3.5 text-lg font-semibold rounded-full shadow-xl shadow-blue-500/40 hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
          Start Shopping
        </button>
      </MockLink>
    </motion.div>
  );
}

// --- Improved CartPage Component ---
export default function CartPage() {
  const { user } = useAuth();
  const { getCart, saveCart, clearCart: clearStoredCart } = useCart();
  
  // Initialize cart state with data from mock storage
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Load from mock storage/DB
  useEffect(() => {
    // In this mock environment, we directly load from useCart's storage logic
    const initialCart = getCart(); 
    setCart(initialCart);
    setLoading(false);

    // No need for external fetch calls in the mock
  }, [getCart]);

  // 🧾 Update cart
  const updateCart = useCallback(
    (updated) => {
      setCart(updated);
      // Save locally using the mock hook
      saveCart(user, updated);
    },
    [user, saveCart]
  );

  // 🗑 Remove item
  const removeItem = useCallback(
    (id) => updateCart(cart.filter((item) => item.id !== id)),
    [cart, updateCart]
  );

  // 🧹 Clear cart
  const clearCart = useCallback(() => {
    clearStoredCart();
    setCart([]);
  }, [clearStoredCart]);

  // 🔄 Quantity change
  const changeQuantity = useCallback(
    (id, delta) => {
      const updated = cart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      updateCart(updated);
    },
    [cart, updateCart]
  );

  const subtotal = useMemo(
    () =>
      Array.isArray(cart)
        ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        : 0,
    [cart]
  );

  // Using window.location.href for routing in the single-file environment
  const handleCheckout = () => {
    console.log('Navigating to checkout...');
    // window.location.href = user ? '/checkout' : '/login';
    // For demo, just show a message:
    alert("Proceeding to Checkout! (Navigation mocked)");
  };

  return (
    // Premium, deep space blue background
    <div className="min-h-screen bg-[#070E20] text-white px-4 py-16 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Main Title - Animated and Gradient */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-extrabold mb-12 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-lg"
        >
          Shopping Cart
        </motion.h1>

        {loading ? (
          <div className="text-center py-40 text-2xl text-blue-300/80">
            <svg className="mx-auto h-8 w-8 animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4">Loading your premium cart contents...</p>
          </div>
        ) : cart.length === 0 ? (
          // Empty Cart Component
          <EmptyCart />
        ) : (
          // Main Cart Content - Responsive Grid Layout
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Cart Items List - Enhanced Card Design */}
            <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] p-8 border border-slate-700/50">
              <h2 className="text-2xl font-semibold mb-6 text-blue-300">
                Your Selections ({cart.length} items)
              </h2>
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout="position"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, height: 0, padding: 0, transition: { duration: 0.3 } }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="flex flex-col sm:flex-row items-center justify-between py-6 gap-6 border-b border-slate-700 last:border-none"
                  >
                    {/* Product Details */}
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      {/* Product Image */}
                      <div className="w-24 h-24 relative rounded-xl overflow-hidden flex-shrink-0 shadow-2xl border border-blue-500/20">
                        <ProductImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="object-cover transition duration-300 hover:scale-105"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white hover:text-blue-300 transition duration-200">
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    {/* Controls & Subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      
                      {/* Quantity Control */}
                      <div className="flex items-center bg-slate-900/50 rounded-full overflow-hidden shadow-inner border border-slate-700">
                        <button
                          onClick={() => changeQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="px-3 py-2 text-blue-300 hover:bg-blue-900/50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="px-4 font-medium text-white text-lg min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          className="px-3 py-2 text-blue-300 hover:bg-blue-900/50 transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <p className="w-24 text-right font-extrabold text-xl text-cyan-300 flex-shrink-0">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-red-400 hover:text-red-500 hover:scale-110 transition duration-200 ml-4 flex-shrink-0"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 🧾 Order Summary - Floating Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
              className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-[0_10px_30px_rgba(8,_112,_184,_0.5)] p-6 border border-slate-700/50 h-fit sticky lg:top-8"
            >
              <h2 className="text-3xl font-bold mb-8 text-blue-200 border-b border-slate-700 pb-4">
                Summary
              </h2>
              <div className="space-y-4 mb-8 text-blue-100">
                
                {/* Subtotal */}
                <div className="flex justify-between text-lg">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-lg">
                  <span className="text-slate-300">Shipping</span>
                  <span className="font-semibold text-green-400">Free</span>
                </div>
                
                {/* Total */}
                <div className="flex justify-between text-2xl font-extrabold text-white pt-4 border-t border-slate-700">
                  <span>Order Total</span>
                  <span className="text-cyan-300">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* High-Conversion Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-4 text-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold rounded-xl shadow-2xl shadow-blue-500/50 hover:scale-[1.03] transition-all duration-300 ease-in-out cursor-pointer transform hover:-translate-y-0.5"
              >
                Proceed to Checkout
              </button>

              {/* Utility Links */}
              <div className="flex flex-col items-center mt-6 space-y-3">
                <button
                  onClick={clearCart}
                  className="text-sm text-slate-400 hover:text-red-400 transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={16} /> Clear All Items
                </button>
                
                <MockLink
                  href="/products"
                  className="flex items-center justify-center gap-2 text-blue-300 hover:text-blue-100 font-medium transition cursor-pointer text-base mt-4"
                >
                  <ArrowLeft size={18} /> Continue Shopping
                </MockLink>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
