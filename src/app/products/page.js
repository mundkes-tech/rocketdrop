'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/hooks/useCart';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext'; 
import { Sliders, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/button';
import ProductCard from '@/components/product-card';
import { toast } from 'react-hot-toast';
import { triggerCartConfetti } from '@/utils/confetti';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Skeleton } from '@/components/skeleton';
import { useSearchParams } from 'next/navigation';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ProductsPage() {
  const { user } = useAuth(); // ✅ ADD THIS LINE
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  // ✅ Access all cart helpers once
  const { addToCart, saveCart, clearCart, getItemsCount } = useCart();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const limit = 8;

  // ✅ Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.categories || []); // ✅ FIXED
        console.log("📦 Categories fetched:", data.categories);
      } catch (err) {
        console.error('❌ Error loading categories:', err);
      }
    }
    fetchCategories();
  }, []);


  // ✅ Build query dynamically
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort: sortBy,
    minPrice: priceRange.min.toString(),
    maxPrice: priceRange.max.toString(),
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(selectedCategories.length === 1 ? { category: selectedCategories[0] } : {}),
  }).toString();

  const { data, error, isLoading } = useSWR(`/api/products?${query}`, fetcher);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const cartControls = useAnimation();

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    return data.products;
  }, [data?.products]);


  const handleAddToCart = (product) => {
    addToCart(product);
    triggerCartConfetti(0.9, 0.1);
    toast.success(`${product.name} added to your cart 🛒`);
  };


  const toggleCategory = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000 });
    setSortBy('featured');
  };

  if (isLoading)
    return (
      <div className="container mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    );

  if (error)
    return <p className="text-center text-red-500 mt-10">⚠️ Failed to load products.</p>;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#004a7c]">All Products</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 cursor-pointer focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="trending">Trending</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Mobile Filters Button */}
          <Button variant="outline" onClick={() => setShowFilters(true)} className="flex items-center gap-2 md:hidden">
            <Sliders className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            clearFilters={clearFilters}
          />
        </aside>

        {/* Product Grid */}
        <section className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-medium mb-4 text-gray-700">
                {searchQuery ? `No results found for "${searchQuery}"` : 'No products found'}
              </h2>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? 'Try a different search term or clear filters.'
                  : 'Try adjusting your filters or check back later.'}
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product, user)} />
                ))}
              </motion.div>

              {/* Pagination */}
              <div className="flex justify-center mt-10 gap-4">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {data?.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === data?.totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, data.totalPages))}
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
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowFilters(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#004a7c]">Filters</h2>
                <button onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <FilterSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                clearFilters={clearFilters}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.div animate={cartControls} />
    </div>
  );
}

// ✅ Filter Sidebar Component
function FilterSidebar({ categories, selectedCategories, toggleCategory, priceRange, setPriceRange, clearFilters }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Filters</h2>
        <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-medium mb-3 text-gray-800">Categories</h3>
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="rounded"
              />
              <span className="text-gray-700">{cat.name}</span>
            </label>
          ))
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3 text-gray-800">Price Range</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
              className="w-full p-2 border rounded-md"
              placeholder="Min"
            />
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              className="w-full p-2 border rounded-md"
              placeholder="Max"
            />
          </div>
        </div>
      </div>
    </div>
  );
}




// 'use client';

// import { useState, useEffect } from 'react';
// import { categories } from '@/lib/mock-data';
// import { ProductCard } from '@/components/product-card';
// import { Sliders, ChevronDown } from 'lucide-react';
// import { Button } from '@/components/button';
// import { toast } from 'react-hot-toast';
// import { triggerCartConfetti } from "@/utils/confetti";
// import { motion, useAnimation } from 'framer-motion';

// export default function ProductsPage() {
//   const [allProducts, setAllProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showFilters, setShowFilters] = useState(false);

//   // Filter states
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
//   const [sortBy, setSortBy] = useState('featured');

//   // 🎯 For cart animation & bounce
//   const cartControls = useAnimation();

//   // ✅ Load products dynamically from DB
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await fetch('/api/products');
//         const data = await res.json();
//         setAllProducts(data);
//         setFilteredProducts(data);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   // ✅ Apply filters & sorting
//   useEffect(() => {
//     let result = [...allProducts];

//     if (selectedCategories.length > 0) {
//       result = result.filter((product) =>
//         selectedCategories.includes(String(product.category_id))
//       );
//     }

//     result = result.filter(
//       (product) =>
//         (product.discountPrice || product.price) >= priceRange.min &&
//         (product.discountPrice || product.price) <= priceRange.max
//     );

//     switch (sortBy) {
//       case 'price-low':
//         result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
//         break;
//       case 'price-high':
//         result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
//         break;
//       case 'newest':
//         result.sort((a, b) => b.id - a.id);
//         break;
//       case 'rating':
//         result.sort((a, b) => b.rating - a.rating);
//         break;
//       default:
//         result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
//         break;
//     }

//     setFilteredProducts(result);
//   }, [allProducts, selectedCategories, priceRange, sortBy]);

//   // ✅ Add to Cart (LocalStorage + Confetti + Lottie + Bounce)
//   const addToCart = async (product) => {
//     const userData = JSON.parse(localStorage.getItem('user'));
//     if (!userData) {
//       toast.error('Please login to add products to cart');
//       return;
//     }

//     const userCartKey = `cart_${userData.email}`;
//     const cart = JSON.parse(localStorage.getItem(userCartKey)) || [];

//     const index = cart.findIndex((item) => item.id === product.id);
//     if (index !== -1) {
//       cart[index].quantity += 1;
//     } else {
//       cart.push({ ...product, quantity: 1 });
//     }

//     localStorage.setItem(userCartKey, JSON.stringify(cart));

//     // 🎉 Trigger confetti near top-right (cart icon area)
//     triggerCartConfetti(0.92, 0.08);

//     // 🛍️ Animate cart bounce effect
//     await cartControls.start({ scale: 1.4, transition: { duration: 0.15 } });
//     await cartControls.start({ scale: 1, transition: { type: "spring", stiffness: 200 } });

//     toast.success(`${product.name} added to your cart 🛒`);
//   };

//   // ✅ Filter helpers
//   const toggleCategory = (categorySlug) => {
//     setSelectedCategories((prev) =>
//       prev.includes(categorySlug)
//         ? prev.filter((c) => c !== categorySlug)
//         : [...prev, categorySlug]
//     );
//   };

//   const clearFilters = () => {
//     setSelectedCategories([]);
//     setPriceRange({ min: 0, max: 1000 });
//     setSortBy('featured');
//   };

//   const toggleFilters = () => setShowFilters(!showFilters);

//   // ✅ Loading spinner
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-[70vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004a7c]" />
//       </div>
//     );
//   }

//   // ✅ Main Layout
//   return (
//     <div className="container mx-auto px-4 py-8 relative">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-[#004a7c]">All Products</h1>

//         <div className="flex items-center gap-4">
//           {/* Sort Dropdown */}
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
//               <option value="rating">Highest Rated</option>
//             </select>
//             <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
//           </div>

//           <Button variant="outline" onClick={toggleFilters} className="flex items-center gap-2 md:hidden">
//             <Sliders className="h-4 w-4" />
//             Filters
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Sidebar Filters (Desktop) */}
//         <aside className="hidden md:block w-64 flex-shrink-0">
//           <div className="bg-white p-6 rounded-lg shadow-md border">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="font-semibold">Filters</h2>
//               <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
//                 Clear All
//               </button>
//             </div>

//             {/* Categories */}
//             <div className="mb-6">
//               <h3 className="font-medium mb-3 text-gray-800">Categories</h3>
//               <div className="space-y-2">
//                 {categories.map((category) => (
//                   <label key={category.id} className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={selectedCategories.includes(String(category.id))}
//                       onChange={() => toggleCategory(String(category.id))}
//                       className="rounded"
//                     />
//                     <span className="text-gray-700">{category.name}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* Price Range */}
//             <div>
//               <h3 className="font-medium mb-3 text-gray-800">Price Range</h3>
//               <div className="space-y-4">
//                 <div className="flex gap-2">
//                   <div>
//                     <label className="text-xs text-gray-500">Min</label>
//                     <input
//                       type="number"
//                       value={priceRange.min}
//                       onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
//                       className="w-full p-2 border rounded-md"
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500">Max</label>
//                     <input
//                       type="number"
//                       value={priceRange.max}
//                       onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
//                       className="w-full p-2 border rounded-md"
//                     />
//                   </div>
//                 </div>
//                 <input
//                   type="range"
//                   min="0"
//                   max="1000"
//                   value={priceRange.max}
//                   onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
//                   className="w-full accent-[#004a7c]"
//                 />
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* Products Grid */}
//         <section className="flex-1">
//           {filteredProducts.length === 0 ? (
//             <div className="text-center py-16 bg-white rounded-lg shadow-md">
//               <h2 className="text-xl font-medium mb-4 text-gray-700">No products found</h2>
//               <p className="text-gray-500 mb-6">Try adjusting your filters or check back later.</p>
//               <Button onClick={clearFilters}>Clear Filters</Button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {filteredProducts.map((product) => (
//                 <ProductCard
//                   key={product.id}
//                   product={product}
//                   onAddToCart={() => addToCart(product)}
//                 />
//               ))}
//             </div>
//           )}
//         </section>
//       </div>

//       {/* Cart bounce controller */}
//       <motion.div animate={cartControls} />
//     </div>
//   );
// }
