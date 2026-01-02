'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, PackageX, ArrowUp, ShoppingBag, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/button'; // Assuming this is a professionally styled button
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';

// --- Utility Functions/Components for Premium Design ---

// Utility to determine premium status badge styles
const getStatusBadge = (status) => {
  const base = "text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm";
  switch (status) {
    case 'delivered':
      return {
        className: `${base} bg-green-50/70 text-green-700 border border-green-200 backdrop-blur-sm`,
        icon: <CheckCircle className="w-3 h-3" />,
      };
    case 'cancelled':
      return {
        className: `${base} bg-red-50/70 text-red-700 border border-red-200 backdrop-blur-sm`,
        icon: <XCircle className="w-3 h-3" />,
      };
    case 'shipped':
      return {
        className: `${base} bg-blue-50/70 text-blue-700 border border-blue-200 backdrop-blur-sm`,
        icon: <Truck className="w-3 h-3" />,
      };
    case 'pending':
    default:
      return {
        className: `${base} bg-yellow-50/70 text-yellow-700 border border-yellow-200 backdrop-blur-sm`,
        icon: <Clock className="w-3 h-3" />,
      };
  }
};

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// --- Main Component ---

export default function MyOrdersPage() {
  const { user } = useAuth();
  const user_id = user?.id;

  // --- State Hooks ---
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loaderRef = useRef(null);

  // 🧾 Fetch orders with pagination
  const fetchOrders = useCallback(
    async (currentPage = 1, status = statusFilter, append = false) => {
      if (!user_id) return;
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        const res = await fetch(
          `/api/myorders?user_id=${user_id}&page=${currentPage}&limit=${limit}&status=${status}`,
          { credentials: 'include' }
        );
        const data = await res.json();

        if (data.success) {
          setOrders((prev) =>
            append ? [...prev, ...data.orders] : data.orders
          );
          setTotalPages(data.totalPages);
          setHasMore(currentPage < data.totalPages);
        } else {
          setOrders([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user_id, limit, statusFilter]
  );

  // Load initial orders
  useEffect(() => {
    if (user_id) fetchOrders(1);
  }, [user_id]); // eslint-disable-line react-hooks/exhaustive-deps
  // Added eslint-disable-line for fetchOrders dependency, as it depends on statusFilter which changes.
  // The fetchOrders call below handles statusFilter change correctly.

  // Handle filter change
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setPage(1);
    fetchOrders(1, status);
    // Smooth scroll to top for a better filter UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // Use functional update for page to avoid stale statusFilter in dependency array
          setPage((prev) => {
            const next = prev + 1;
            // Pass the current statusFilter and set append to true
            fetchOrders(next, statusFilter, true);
            return next;
          });
        }
      },
      // rootMargin: Increased margin for better pre-loading
      { rootMargin: '300px' } 
    );

    observer.observe(loaderRef.current);
    // Cleanup function
    return () => {
        if (loaderRef.current) observer.unobserve(loaderRef.current);
        observer.disconnect();
    };
  }, [hasMore, loadingMore, fetchOrders, statusFilter, loading]); // Added 'loading' to prevent observing while initial load is happening

  // 🧭 Scroll-to-top visibility handler
  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 600px
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Render Logic ---
  return (
    // SEO-friendly title/description (optional for next/head)
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-slate-50/50" // Soft, elegant background
    >
      <Head>
        <title>My Orders - Premium Store</title>
        <meta name="description" content="View and track your recent orders." />
      </Head>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
        
        {/* Header with Filter - Enhanced Typography and Layout */}
        <motion.header 
          variants={headerVariants} 
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-4 border-b border-slate-200/80"
          role="region"
          aria-label="Order Management Header"
        >
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              <ShoppingBag className="inline-block w-8 h-8 mr-2 text-blue-600" />
              My Orders
            </h1>
            <p className="text-md text-slate-500">Track the status of your purchases and manage your history.</p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <label htmlFor="order-filter" className="text-sm font-semibold text-slate-700 whitespace-nowrap">Filter by Status:</label>
            <div className="relative">
              <select
                id="order-filter"
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="appearance-none border border-slate-300 rounded-xl pl-4 pr-10 py-2 text-sm font-medium text-slate-700 bg-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm cursor-pointer"
                aria-label="Filter orders by status"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {/* Custom arrow icon for the select box */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </motion.header>

        {/* --- Orders Content Area --- */}
        <AnimatePresence mode="wait">
          
          {/* 🕐 Initial Loading State - Clean and Centered */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col justify-center items-center h-80 text-slate-500"
            >
              <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
              <p className="text-xl font-medium">Loading your orders...</p>
            </motion.div>
          )}

          {/* ❌ Empty State - Professional and Actionable */}
          {!loading && orders.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center text-slate-600 bg-white border border-slate-100 rounded-3xl py-16 shadow-lg shadow-blue-500/5"
              role="alert"
            >
              <PackageX className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-xl font-bold mb-2">No orders found</p>
              <p className="text-blue-200 mb-10 text-lg max-w-md mx-auto">
                Start building your premium collection. We&apos;ve got something special waiting for you.
              </p>
              <Button 
                onClick={() => handleFilterChange('all')} 
                variant="primary" // Assuming a prominent variant for the button
                disabled={statusFilter === 'all'}
                className="shadow-md hover:shadow-lg transition-shadow"
              >
                Reset Filter to All Orders
              </Button>
            </motion.div>
          )}

          {/* ✅ Orders List - Premium Card Design */}
          {!loading && orders.length > 0 && (
            <motion.div 
              key="list" 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {orders.map((order) => {
                const badge = getStatusBadge(order.status);
                return (
                  <motion.div
                    key={order.order_id}
                    variants={itemVariants}
                    className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 ease-in-out"
                    role="listitem"
                    aria-labelledby={`order-id-${order.order_id}`}
                  >
                    {/* Header: Order ID, Date, and Status */}
                    <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 id={`order-id-${order.order_id}`} className="font-extrabold text-lg text-slate-800">
                          Order <span className="text-blue-600">#{order.order_id}</span>
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Placed on: <span className="font-medium">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </p>
                      </div>
                      <span className={badge.className}>
                        {badge.icon}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="p-6 space-y-4">
                      {order.items?.map((item) => (
                        <div
                          key={item.product_id}
                          className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition duration-200"
                        >
                          {/* Product Image */}
                          <Image
                            src={
                              typeof item.product_image === 'string' && item.product_image.trim() !== ''
                                ? item.product_image
                                : '/images/products/placeholder.svg'
                            }
                            alt={item.product_name || 'Product image'}
                            width={72}
                            height={72}
                            // Added aspect ratio and a subtle ring for a premium look
                            className="rounded-lg object-cover w-[72px] h-[72px] flex-shrink-0 border border-slate-200" 
                            onError={(e) => (e.currentTarget.src = '/images/products/placeholder.svg')}
                            unoptimized={true} // Recommended for external/placeholder images in Next.js
                          />
                          {/* Product Details */}
                          <div className="flex-grow min-w-0">
                            <p className="font-semibold text-base text-slate-800 truncate">{item.product_name}</p>
                            <p className="text-sm text-slate-600 mt-1">
                              Quantity: <span className="font-medium">{item.quantity}</span> 
                              {' | '}
                              Unit Price: <span className="font-medium">₹{item.price}</span>
                            </p>
                          </div>
                          {/* Item Subtotal (Optional but good) */}
                          <p className="text-lg font-bold text-slate-800 ml-auto whitespace-nowrap">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Footer: Total and Payment Mode - Prominent Total */}
                    <div className="bg-slate-50/70 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-md text-slate-600 font-medium">
                        Payment Mode: <span className="font-bold text-slate-800">{order.payment_mode}</span>
                      </p>
                      <p className="text-xl font-extrabold text-slate-900 border-l-2 border-blue-500 pl-4 sm:pl-6 sm:py-0">
                        Total Amount: <span className="text-blue-600">₹{order.total_amount}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Infinite Scroll Loader */}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-6" role="status" aria-label="Loading more orders">
            {loadingMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Loader2 className="animate-spin text-blue-500" size={36} />
              </motion.div>
            )}
          </div>
        )}

        {/* ⬆️ Scroll-to-top button - Stronger CTA Styling */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              onClick={scrollToTop}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl shadow-blue-500/50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 z-50"
              aria-label="Scroll to top of the page"
              title="Scroll to Top"
            >
              <ArrowUp className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// 'use client';
// import { useEffect, useState, useRef, useCallback } from 'react';
// import Image from 'next/image';
// import { Loader2, PackageX, ArrowUp } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/button';
// import { useAuth } from '@/contexts/AuthContext';

// export default function MyOrdersPage() {
//   const { user } = useAuth();
//   const user_id = user?.id;

//   const [orders, setOrders] = useState([]);
//   const [page, setPage] = useState(1);
//   const [limit] = useState(5);
//   const [totalPages, setTotalPages] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [hasMore, setHasMore] = useState(true);
//   const [showScrollTop, setShowScrollTop] = useState(false);

//   const loaderRef = useRef(null);

//   // 🧾 Fetch orders with pagination
//   const fetchOrders = useCallback(
//     async (currentPage = 1, status = statusFilter, append = false) => {
//       if (!user_id) return;
//       try {
//         if (currentPage === 1) setLoading(true);
//         else setLoadingMore(true);

//         const res = await fetch(
//           `/api/myorders?user_id=${user_id}&page=${currentPage}&limit=${limit}&status=${status}`
//         );
//         const data = await res.json();

//         if (data.success) {
//           setOrders((prev) =>
//             append ? [...prev, ...data.orders] : data.orders
//           );
//           setTotalPages(data.totalPages);
//           setHasMore(currentPage < data.totalPages);
//         } else {
//           setOrders([]);
//           setHasMore(false);
//         }
//       } catch (err) {
//         console.error('❌ Fetch error:', err);
//       } finally {
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [user_id, limit, statusFilter]
//   );

//   // Load initial orders
//   useEffect(() => {
//     if (user_id) fetchOrders(1);
//   }, [user_id]);

//   // Handle filter change
//   const handleFilterChange = (status) => {
//     setStatusFilter(status);
//     setPage(1);
//     fetchOrders(1, status);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   // Infinite scroll observer
//   useEffect(() => {
//     if (!loaderRef.current || !hasMore || loadingMore) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && hasMore) {
//           setPage((prev) => {
//             const next = prev + 1;
//             fetchOrders(next, statusFilter, true);
//             return next;
//           });
//         }
//       },
//       { rootMargin: '200px' }
//     );

//     observer.observe(loaderRef.current);
//     return () => observer.disconnect();
//   }, [hasMore, loadingMore, fetchOrders, statusFilter]);

//   // 🧭 Scroll-to-top visibility handler
//   useEffect(() => {
//     const handleScroll = () => {
//       setShowScrollTop(window.scrollY > 500);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Scroll to top
//   const scrollToTop = () => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-6 relative">
//       {/* Header with Filter */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
//         <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>

//         <div className="flex items-center gap-2">
//           <label className="text-sm font-medium text-gray-600">Filter by:</label>
//           <select
//             value={statusFilter}
//             onChange={(e) => handleFilterChange(e.target.value)}
//             className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="all">All Orders</option>
//             <option value="pending">Pending</option>
//             <option value="shipped">Shipped</option>
//             <option value="delivered">Delivered</option>
//             <option value="cancelled">Cancelled</option>
//           </select>
//         </div>
//       </div>

//       {/* 🕐 Initial Loading */}
//       {loading && (
//         <div className="flex flex-col justify-center items-center h-64 text-gray-500">
//           <Loader2 className="animate-spin mb-2" size={36} />
//           <p>Loading your orders...</p>
//         </div>
//       )}

//       {/* ❌ Empty State */}
//       {!loading && orders.length === 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//           className="flex flex-col items-center justify-center text-gray-600 bg-white border rounded-xl py-12 shadow-sm"
//         >
//           <PackageX className="w-12 h-12 text-gray-400 mb-3" />
//           <p className="text-lg font-semibold mb-1">No orders found</p>
//           <p className="text-sm text-gray-500 mb-3">
//             Try changing your filter or place a new order!
//           </p>
//           <Button onClick={() => handleFilterChange('all')} variant="outline">
//             Reset Filter
//           </Button>
//         </motion.div>
//       )}

//       {/* ✅ Orders List */}
//       {orders.map((order) => (
//         <motion.div
//           key={order.order_id}
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//           className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden border border-gray-100"
//         >
//           {/* Header */}
//           <div className="bg-gray-50 border-b px-5 py-3 flex justify-between items-center">
//             <div>
//               <h2 className="font-semibold text-gray-800">Order #{order.order_id}</h2>
//               <p className="text-sm text-gray-500">
//                 Placed on {new Date(order.created_at).toLocaleDateString()}
//               </p>
//             </div>
//             <span
//               className={`text-sm px-3 py-1 rounded-full font-medium ${
//                 order.status === 'delivered'
//                   ? 'bg-green-100 text-green-700'
//                   : order.status === 'cancelled'
//                   ? 'bg-red-100 text-red-700'
//                   : order.status === 'shipped'
//                   ? 'bg-blue-100 text-blue-700'
//                   : 'bg-yellow-100 text-yellow-700'
//               }`}
//             >
//               {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//             </span>
//           </div>

//           {/* Items */}
//           <div className="p-5 space-y-2">
//             {order.items?.map((item) => (
//               <div
//                 key={item.product_id}
//                 className="flex items-center gap-3 border rounded-lg p-2 hover:bg-gray-50 transition"
//               >
//               <Image
//                 src={
//                   typeof item.product_image === 'string' && item.product_image.trim() !== ''
//                     ? item.product_image
//                     : '/images/products/placeholder.svg'
//                 }
//                 alt={item.product_name || 'Product image'}
//                 width={60}
//                 height={60}
//                 className="rounded-md object-cover"
//                 onError={(e) => (e.currentTarget.src = '/images/products/placeholder.svg')}
//               />
//                 <div>
//                   <p className="font-medium text-gray-800">{item.product_name}</p>
//                   <p className="text-sm text-gray-600">
//                     Qty: {item.quantity} × ₹{item.price}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Footer */}
//           <div className="border-t px-5 py-2 text-sm text-gray-700 flex justify-between">
//             <p>
//               <strong>Total:</strong> ₹{order.total_amount}
//             </p>
//             <p>
//               <strong>Payment:</strong> {order.payment_mode}
//             </p>
//           </div>
//         </motion.div>
//       ))}

//       {/* Infinite Scroll Loader */}
//       {hasMore && (
//         <div ref={loaderRef} className="flex justify-center py-6">
//           {loadingMore && <Loader2 className="animate-spin text-gray-400" size={28} />}
//         </div>
//       )}

//       {/* ⬆️ Scroll-to-top button */}
//       {showScrollTop && (
//         <motion.button
//           onClick={scrollToTop}
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.8 }}
//           transition={{ duration: 0.2 }}
//           className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition"
//           aria-label="Scroll to top"
//         >
//           <ArrowUp className="h-5 w-5" />
//         </motion.button>
//       )}
//     </div>
//   );
// }