'use client';

import { useState, useEffect } from 'react';
import { categories } from '@/lib/mock-data';
import { ProductCard } from '@/components/product-card';
import { Sliders, ChevronDown } from 'lucide-react';
import { Button } from '@/components/button';
import { toast } from 'react-hot-toast';
import { triggerCartConfetti } from "@/utils/confetti";
import { motion, useAnimation } from 'framer-motion';

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('featured');

  // 🎯 For cart animation & bounce
  const cartControls = useAnimation();

  // ✅ Load products dynamically from DB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setAllProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Apply filters & sorting
  useEffect(() => {
    let result = [...allProducts];

    if (selectedCategories.length > 0) {
      result = result.filter((product) =>
        selectedCategories.includes(String(product.category_id))
      );
    }

    result = result.filter(
      (product) =>
        (product.discountPrice || product.price) >= priceRange.min &&
        (product.discountPrice || product.price) <= priceRange.max
    );

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredProducts(result);
  }, [allProducts, selectedCategories, priceRange, sortBy]);

  // ✅ Add to Cart (LocalStorage + Confetti + Lottie + Bounce)
  const addToCart = async (product) => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      toast.error('Please login to add products to cart');
      return;
    }

    const userCartKey = `cart_${userData.email}`;
    const cart = JSON.parse(localStorage.getItem(userCartKey)) || [];

    const index = cart.findIndex((item) => item.id === product.id);
    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem(userCartKey, JSON.stringify(cart));

    // 🎉 Trigger confetti near top-right (cart icon area)
    triggerCartConfetti(0.92, 0.08);

    // 🛍️ Animate cart bounce effect
    await cartControls.start({ scale: 1.4, transition: { duration: 0.15 } });
    await cartControls.start({ scale: 1, transition: { type: "spring", stiffness: 200 } });

    toast.success(`${product.name} added to your cart 🛒`);
  };

  // ✅ Filter helpers
  const toggleCategory = (categorySlug) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000 });
    setSortBy('featured');
  };

  const toggleFilters = () => setShowFilters(!showFilters);

  // ✅ Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004a7c]" />
      </div>
    );
  }

  // ✅ Main Layout
  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#004a7c]">All Products</h1>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
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
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
          </div>

          <Button variant="outline" onClick={toggleFilters} className="flex items-center gap-2 md:hidden">
            <Sliders className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
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
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(String(category.id))}
                      onChange={() => toggleCategory(String(category.id))}
                      className="rounded"
                    />
                    <span className="text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-medium mb-3 text-gray-800">Price Range</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Min</label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max</label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-full accent-[#004a7c]"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <section className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-medium mb-4 text-gray-700">No products found</h2>
              <p className="text-gray-500 mb-6">Try adjusting your filters or check back later.</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Cart bounce controller */}
      <motion.div animate={cartControls} />
    </div>
  );
}




// 'use client';

// import { useState, useEffect } from 'react';
// import { products, categories } from '@/lib/mock-data';
// import { ProductCard } from '@/components/product-card';
// import { Sliders, ChevronDown, X } from 'lucide-react';
// import { Button } from '@/components/button';

// export default function ProductsPage() {
//   const [allProducts, setAllProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showFilters, setShowFilters] = useState(false);
  
//   // Filter states
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
//   const [sortBy, setSortBy] = useState('featured');
  
//   useEffect(() => {
//     // Load products
//     setAllProducts(products || []);
//     setFilteredProducts(products || []);
//     setLoading(false);
//   }, []);
  
//   useEffect(() => {
//     // Apply filters
//     let result = [...allProducts];
    
//     // Filter by categories
//     if (selectedCategories.length > 0) {
//       result = result.filter(product => 
//         selectedCategories.includes(product.category)
//       );
//     }
    
//     // Filter by price range
//     result = result.filter(product => 
//       (product.discountPrice || product.price) >= priceRange.min && 
//       (product.discountPrice || product.price) <= priceRange.max
//     );
    
//     // Apply sorting
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
//       default: // featured
//         result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
//         break;
//     }
    
//     setFilteredProducts(result);
//   }, [allProducts, selectedCategories, priceRange, sortBy]);
  
//   const toggleCategory = (categorySlug) => {
//     setSelectedCategories(prev => 
//       prev.includes(categorySlug)
//         ? prev.filter(c => c !== categorySlug)
//         : [...prev, categorySlug]
//     );
//   };
  
//   const clearFilters = () => {
//     setSelectedCategories([]);
//     setPriceRange({ min: 0, max: 1000 });
//     setSortBy('featured');
//   };
  
//   const toggleFilters = () => {
//     setShowFilters(!showFilters);
//   };
  
//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-16">
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">All Products</h1>
        
//         <div className="flex items-center gap-4">
//           <div className="relative">
//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 cursor-pointer"
//             >
//               <option value="featured">Featured</option>
//               <option value="price-low">Price: Low to High</option>
//               <option value="price-high">Price: High to Low</option>
//               <option value="newest">Newest</option>
//               <option value="rating">Highest Rated</option>
//             </select>
//             <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
//           </div>
          
//           <Button 
//             variant="outline" 
//             onClick={toggleFilters}
//             className="flex items-center gap-2 md:hidden"
//           >
//             <Sliders className="h-4 w-4" />
//             Filters
//           </Button>
//         </div>
//       </div>
      
//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Filters - Desktop */}
//         <div className="hidden md:block w-64 flex-shrink-0">
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="font-semibold">Filters</h2>
//               <button 
//                 onClick={clearFilters}
//                 className="text-sm text-blue-600 hover:underline"
//               >
//                 Clear All
//               </button>
//             </div>
            
//             <div className="mb-6">
//               <h3 className="font-medium mb-3">Categories</h3>
//               <div className="space-y-2">
//                 {categories.map((category) => (
//                   <label key={category.id} className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={selectedCategories.includes(category.slug)}
//                       onChange={() => toggleCategory(category.slug)}
//                       className="rounded"
//                     />
//                     <span>{category.name}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
            
//             <div>
//               <h3 className="font-medium mb-3">Price Range</h3>
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
//                   className="w-full"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Mobile Filters */}
//         {showFilters && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
//             <div className="bg-white h-full w-80 p-6 ml-auto">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="font-semibold">Filters</h2>
//                 <button onClick={toggleFilters}>
//                   <X className="h-6 w-6" />
//                 </button>
//               </div>
              
//               <div className="mb-6">
//                 <h3 className="font-medium mb-3">Categories</h3>
//                 <div className="space-y-2">
//                   {categories.map((category) => (
//                     <label key={category.id} className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={selectedCategories.includes(category.slug)}
//                         onChange={() => toggleCategory(category.slug)}
//                         className="rounded"
//                       />
//                       <span>{category.name}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
              
//               <div className="mb-6">
//                 <h3 className="font-medium mb-3">Price Range</h3>
//                 <div className="space-y-4">
//                   <div className="flex gap-2">
//                     <div>
//                       <label className="text-xs text-gray-500">Min</label>
//                       <input
//                         type="number"
//                         value={priceRange.min}
//                         onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
//                         className="w-full p-2 border rounded-md"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs text-gray-500">Max</label>
//                       <input
//                         type="number"
//                         value={priceRange.max}
//                         onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
//                         className="w-full p-2 border rounded-md"
//                       />
//                     </div>
//                   </div>
//                   <input
//                     type="range"
//                     min="0"
//                     max="1000"
//                     value={priceRange.max}
//                     onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
//                     className="w-full"
//                   />
//                 </div>
//               </div>
              
//               <div className="flex gap-2 mt-auto">
//                 <Button 
//                   variant="outline" 
//                   onClick={clearFilters}
//                   className="flex-1"
//                 >
//                   Clear
//                 </Button>
//                 <Button 
//                   onClick={toggleFilters}
//                   className="flex-1"
//                 >
//                   Apply
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {/* Products Grid */}
//         <div className="flex-1">
//           {filteredProducts.length === 0 ? (
//             <div className="text-center py-16 bg-white rounded-lg shadow-md">
//               <h2 className="text-xl font-medium mb-4">No products found</h2>
//               <p className="text-gray-500 mb-6">Try adjusting your filters</p>
//               <Button onClick={clearFilters}>Clear Filters</Button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {filteredProducts.map((product) => (
//                 <ProductCard key={product.id} product={product} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }