'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/hooks/useCart';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext'; 
import { Sliders, ChevronDown, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/button';
import ProductCard from '@/components/product-card';
import { toast } from 'react-hot-toast';
import { triggerCartConfetti } from '@/utils/confetti';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Skeleton } from '@/components/skeleton';
import { useSearchParams } from 'next/navigation';

// --- Design Constants ---
const PRIMARY_TEXT_COLOR = 'text-[#0A192F]'; // Dark Navy/Charcoal
const ACCENT_COLOR_CLASS = 'bg-[#1abc9c] hover:bg-[#16a085]'; // Soft Teal/Cyan
const ACCENT_TEXT_COLOR = 'text-[#1abc9c]';
const LIGHT_BG = 'bg-gray-50';

const fetcher = (url) => fetch(url).then((r) => r.json());

// --- Animation Variants ---
const sidebarVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' }
};

const productGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const productItemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.98 },
  visible: { y: 0, opacity: 1, scale: 1 },
};


export default function ProductsPage() {
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const { addToCart, getItemsCount } = useCart(); // Destructure what's needed
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const limit = 12; // Increased limit for a better visual grid

  // ✅ Fetch categories (Simplified and robust)
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('❌ Error loading categories:', err);
        toast.error('Could not load categories.');
      }
    }
    fetchCategories();
  }, []);

  // ✅ Build query dynamically
  const query = useMemo(() => {
    return new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort: sortBy,
      minPrice: priceRange.min.toString(),
      maxPrice: priceRange.max.toString(),
      ...(searchQuery ? { search: searchQuery } : {}),
      // Fix: Supports multiple categories if desired, or stick to single if API only handles one
      ...(selectedCategories.length > 0 ? { category: selectedCategories.join(',') } : {}),
    }).toString();
  }, [page, limit, sortBy, priceRange, searchQuery, selectedCategories]);

  const { data, error, isLoading, mutate } = useSWR(`/api/products?${query}`, fetcher);

  // Reset page when search/filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy, priceRange.min, priceRange.max, selectedCategories]);
  
  const cartControls = useAnimation(); // Kept for future cart animation logic

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    return data.products;
  }, [data?.products]);


  const handleAddToCart = (product) => {
    addToCart(product);
    triggerCartConfetti(0.9, 0.1);
    toast.success(`${product.name} added to cart 🛒`);
  };


  const toggleCategory = (slug) => {
    // Allows multiple selections, if the API supports it
    setSelectedCategories((prev) =>
      prev.includes(slug) 
        ? prev.filter((c) => c !== slug) 
        : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000 });
    setSortBy('featured');
    setShowFilters(false); // Close mobile filter after clearing
  };
  
  // --- Loading/Error States ---
  if (isLoading && !data)
    return (
      <div className={`container mx-auto px-6 py-10 ${LIGHT_BG}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-red-600 mb-4">⚠️ Failed to load products.</p>
        <Button onClick={() => mutate()} className="flex items-center mx-auto gap-2">
            <RefreshCw className='h-4 w-4'/> Try Reloading
        </Button>
      </div>
    );

  // --- Main Render ---
  return (
    <div className={`min-h-screen ${LIGHT_BG} relative`}>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className={`text-4xl font-extrabold ${PRIMARY_TEXT_COLOR}`}>
            {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
          </h1>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown - Styled to look more professional */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 cursor-pointer shadow-sm ${PRIMARY_TEXT_COLOR} focus:ring-2 focus:ring-[#1abc9c] focus:border-[#1abc9c] transition duration-200`}
                aria-label="Sort products by"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="trending">Trending (Popularity)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Mobile Filters Button */}
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(true)} 
              className="flex items-center gap-2 md:hidden border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <Sliders className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar */}
          <motion.aside 
            className="hidden md:block w-64 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FilterSidebar
              categories={categories}
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              clearFilters={clearFilters}
            />
          </motion.aside>

          {/* Product Grid */}
          <section className="flex-1 min-h-[60vh]">
            {isLoading && data ? (
              // Show skeleton while loading new page/filters
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {[...Array(limit)].map((_, i) => <Skeleton key={`loading-${i}`} className="h-96 rounded-2xl" />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={`text-center py-20 bg-white rounded-xl shadow-lg border border-gray-100 ${PRIMARY_TEXT_COLOR}`}>
                <h2 className="text-2xl font-semibold mb-4">
                  {searchQuery ? `No results found for "${searchQuery}"` : 'No products found'}
                </h2>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? 'Try a different search term or refine your filters.'
                    : 'Try adjusting your filters or check back later for new inventory.'}
                </p>
                <Button onClick={clearFilters} className={ACCENT_COLOR_CLASS}>
                    Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <motion.div
                  layout // Enables smooth layout transitions (e.g., when a product is removed)
                  variants={productGridVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  <AnimatePresence>
                    {filteredProducts.map((product) => (
                      <motion.div key={product.id} variants={productItemVariants} layout>
                        <ProductCard 
                            product={product} 
                            onAddToCart={() => handleAddToCart(product)} 
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                <div className="flex justify-center items-center mt-12 gap-4">
                  <Button 
                    variant="outline" 
                    disabled={page === 1 || data?.totalPages === 0} 
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Previous
                  </Button>
                  <span className={`px-4 py-2 ${PRIMARY_TEXT_COLOR} font-medium`}>
                    Page {data?.totalPages === 0 ? 0 : page} of {data?.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === data?.totalPages || data?.totalPages === 0}
                    onClick={() => setPage((p) => Math.min(p + 1, data.totalPages))}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>

        {/* 🧠 Mobile Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setShowFilters(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Drawer */}
              <motion.aside
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed top-0 left-0 h-full w-72 bg-white backdrop-filter backdrop-blur-md bg-opacity-90 shadow-2xl z-50 p-6 overflow-y-auto md:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Product Filters"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`text-xl font-bold ${PRIMARY_TEXT_COLOR}`}>Filter Options</h2>
                  <button onClick={() => setShowFilters(false)} aria-label="Close filters">
                    <X className="h-6 w-6 text-gray-700 hover:text-gray-900 transition" />
                  </button>
                </div>

                <FilterSidebar
                  categories={categories}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  clearFilters={clearFilters}
                  // New Prop for mobile: Apply filters and close
                  applyFilters={() => setShowFilters(false)} 
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <motion.div animate={cartControls} />
      </div>
    </div>
  );
}

// ✅ Filter Sidebar Component (Refactored for Premium Look)
function FilterSidebar({ categories, selectedCategories, toggleCategory, priceRange, setPriceRange, clearFilters, applyFilters }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-8">
      
      {/* Clear All */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className={`text-lg font-bold ${PRIMARY_TEXT_COLOR}`}>Refine Search</h2>
        <button 
          onClick={clearFilters} 
          className="text-sm text-red-500 font-medium hover:text-red-700 transition"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-lg ${PRIMARY_TEXT_COLOR} mb-3`}>Category</h3>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {categories.map((cat) => (
              <label 
                key={cat.id} 
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                  selectedCategories.includes(cat.slug) 
                    ? 'bg-[#1abc9c]/10 text-[#1abc9c] font-medium' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={() => toggleCategory(cat.slug)}
                  className={`rounded-sm border-gray-300 h-4 w-4 text-[#1abc9c] focus:ring-[#1abc9c]`}
                />
                <span className="text-sm">{cat.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className={`font-semibold text-lg ${PRIMARY_TEXT_COLOR} mb-4`}>Price Range ($)</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc9c] focus:border-[#1abc9c] transition duration-200 shadow-sm"
              placeholder="Min Price"
              aria-label="Minimum Price"
              min="0"
            />
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1abc9c] focus:border-[#1abc9c] transition duration-200 shadow-sm"
              placeholder="Max Price"
              aria-label="Maximum Price"
              min="0"
            />
          </div>
        </div>
      </div>
      
      {/* Apply Button for Mobile */}
      {applyFilters && (
        <div className="md:hidden pt-4 border-t border-gray-100">
             <Button onClick={applyFilters} className={`w-full ${ACCENT_COLOR_CLASS}`}>
                Apply Filters
            </Button>
        </div>
      )}
    </div>
  );
}

// 'use client';

// import { useState, useEffect, useMemo } from 'react';
// import { useCart } from '@/hooks/useCart';
// import useSWR from 'swr';
// import { useAuth } from '@/contexts/AuthContext'; 
// import { Sliders, ChevronDown, X } from 'lucide-react';
// import { Button } from '@/components/button';
// import ProductCard from '@/components/product-card';
// import { toast } from 'react-hot-toast';
// import { triggerCartConfetti } from '@/utils/confetti';
// import { motion, AnimatePresence, useAnimation } from 'framer-motion';
// import { Skeleton } from '@/components/skeleton';
// import { useSearchParams } from 'next/navigation';

// const fetcher = (url) => fetch(url).then((r) => r.json());

// export default function ProductsPage() {
//   const { user } = useAuth(); // ✅ ADD THIS LINE
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
//   const [sortBy, setSortBy] = useState('featured');
//   const [showFilters, setShowFilters] = useState(false);
//   const [page, setPage] = useState(1);
//   const [categories, setCategories] = useState([]);
//   // ✅ Access all cart helpers once
//   const { addToCart, saveCart, clearCart, getItemsCount } = useCart();
//   const searchParams = useSearchParams();
//   const searchQuery = searchParams.get('search') || '';
//   const limit = 8;

//   // ✅ Fetch categories
//   useEffect(() => {
//     async function fetchCategories() {
//       try {
//         const res = await fetch('/api/categories');
//         const data = await res.json();
//         setCategories(data.categories || []); // ✅ FIXED
//         console.log("📦 Categories fetched:", data.categories);
//       } catch (err) {
//         console.error('❌ Error loading categories:', err);
//       }
//     }
//     fetchCategories();
//   }, []);


//   // ✅ Build query dynamically
//   const query = new URLSearchParams({
//     page: page.toString(),
//     limit: limit.toString(),
//     sort: sortBy,
//     minPrice: priceRange.min.toString(),
//     maxPrice: priceRange.max.toString(),
//     ...(searchQuery ? { search: searchQuery } : {}),
//     ...(selectedCategories.length === 1 ? { category: selectedCategories[0] } : {}),
//   }).toString();

//   const { data, error, isLoading } = useSWR(`/api/products?${query}`, fetcher);

//   useEffect(() => {
//     setPage(1);
//   }, [searchQuery]);

//   const cartControls = useAnimation();

//   const filteredProducts = useMemo(() => {
//     if (!data?.products) return [];
//     return data.products;
//   }, [data?.products]);


//   const handleAddToCart = (product) => {
//     addToCart(product);
//     triggerCartConfetti(0.9, 0.1);
//     toast.success(`${product.name} added to your cart 🛒`);
//   };


//   const toggleCategory = (slug) => {
//     setSelectedCategories((prev) =>
//       prev.includes(slug) ? prev.filter((c) => c !== slug) : [slug]
//     );
//   };

//   const clearFilters = () => {
//     setSelectedCategories([]);
//     setPriceRange({ min: 0, max: 1000 });
//     setSortBy('featured');
//   };

//   if (isLoading)
//     return (
//       <div className="container mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//         {[...Array(8)].map((_, i) => (
//           <Skeleton key={i} className="h-64 rounded-2xl" />
//         ))}
//       </div>
//     );

//   if (error)
//     return <p className="text-center text-red-500 mt-10">⚠️ Failed to load products.</p>;

//   return (
//     <div className="container mx-auto px-4 py-8 relative">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-[#004a7c]">All Products</h1>

//         <div className="flex items-center gap-4">
//           <div className="relative">
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 cursor-pointer focus:outline-none"
//             >
//               <option value="featured">Featured</option>
//               <option value="price-low">Price: Low to High</option>
//               <option value="price-high">Price: High to Low</option>
//               <option value="newest">Newest</option>
//               <option value="trending">Trending</option>
//             </select>
//             <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
//           </div>

//           {/* Mobile Filters Button */}
//           <Button variant="outline" onClick={() => setShowFilters(true)} className="flex items-center gap-2 md:hidden">
//             <Sliders className="h-4 w-4" />
//             Filters
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Desktop Sidebar */}
//         <aside className="hidden md:block w-64 flex-shrink-0">
//           <FilterSidebar
//             categories={categories}
//             selectedCategories={selectedCategories}
//             toggleCategory={toggleCategory}
//             priceRange={priceRange}
//             setPriceRange={setPriceRange}
//             clearFilters={clearFilters}
//           />
//         </aside>

//         {/* Product Grid */}
//         <section className="flex-1">
//           {filteredProducts.length === 0 ? (
//             <div className="text-center py-16 bg-white rounded-lg shadow-md">
//               <h2 className="text-xl font-medium mb-4 text-gray-700">
//                 {searchQuery ? `No results found for "${searchQuery}"` : 'No products found'}
//               </h2>
//               <p className="text-gray-500 mb-6">
//                 {searchQuery
//                   ? 'Try a different search term or clear filters.'
//                   : 'Try adjusting your filters or check back later.'}
//               </p>
//               <Button onClick={clearFilters}>Clear Filters</Button>
//             </div>
//           ) : (
//             <>
//               <motion.div
//                 layout
//                 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
//               >
//                 {filteredProducts.map((product) => (
//                   <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product, user)} />
//                 ))}
//               </motion.div>

//               {/* Pagination */}
//               <div className="flex justify-center mt-10 gap-4">
//                 <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
//                   Previous
//                 </Button>
//                 <span className="px-4 py-2 text-gray-700">
//                   Page {page} of {data?.totalPages}
//                 </span>
//                 <Button
//                   variant="outline"
//                   disabled={page === data?.totalPages}
//                   onClick={() => setPage((p) => Math.min(p + 1, data.totalPages))}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </>
//           )}
//         </section>
//       </div>

//       {/* 🧠 Mobile Filter Drawer */}
//       <AnimatePresence>
//         {showFilters && (
//           <>
//             <motion.div
//               className="fixed inset-0 bg-black/40 z-40"
//               onClick={() => setShowFilters(false)}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             />

//             <motion.aside
//               initial={{ x: '-100%' }}
//               animate={{ x: 0 }}
//               exit={{ x: '-100%' }}
//               transition={{ type: 'spring', stiffness: 100, damping: 20 }}
//               className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 p-6 overflow-y-auto"
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold text-[#004a7c]">Filters</h2>
//                 <button onClick={() => setShowFilters(false)}>
//                   <X className="h-5 w-5 text-gray-600" />
//                 </button>
//               </div>

//               <FilterSidebar
//                 categories={categories}
//                 selectedCategories={selectedCategories}
//                 toggleCategory={toggleCategory}
//                 priceRange={priceRange}
//                 setPriceRange={setPriceRange}
//                 clearFilters={clearFilters}
//               />
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>

//       <motion.div animate={cartControls} />
//     </div>
//   );
// }

// // ✅ Filter Sidebar Component
// function FilterSidebar({ categories, selectedCategories, toggleCategory, priceRange, setPriceRange, clearFilters }) {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md border">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="font-semibold">Filters</h2>
//         <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
//           Clear All
//         </button>
//       </div>

//       {/* Categories */}
//       <div className="mb-6">
//         <h3 className="font-medium mb-3 text-gray-800">Categories</h3>
//         {categories.length === 0 ? (
//           <p className="text-sm text-gray-500">Loading...</p>
//         ) : (
//           categories.map((cat) => (
//             <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={selectedCategories.includes(cat.slug)}
//                 onChange={() => toggleCategory(cat.slug)}
//                 className="rounded"
//               />
//               <span className="text-gray-700">{cat.name}</span>
//             </label>
//           ))
//         )}
//       </div>

//       {/* Price Range */}
//       <div>
//         <h3 className="font-medium mb-3 text-gray-800">Price Range</h3>
//         <div className="space-y-4">
//           <div className="flex gap-2">
//             <input
//               type="number"
//               value={priceRange.min}
//               onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
//               className="w-full p-2 border rounded-md"
//               placeholder="Min"
//             />
//             <input
//               type="number"
//               value={priceRange.max}
//               onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
//               className="w-full p-2 border rounded-md"
//               placeholder="Max"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }