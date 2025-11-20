'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/button';
import { formatPrice } from '@/utils/formatPrice';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';

// --- Design Constants ---
const PRIMARY_COLOR = 'text-gray-900';
const ACCENT_COLOR = 'bg-teal-600 hover:bg-teal-700';
const ACCENT_TEXT = 'text-teal-600';

// --- Framer Motion Variants ---
const mainContentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const imageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // For future tabbed details

  const isSupplier = user?.role === 'supplier';

  // ✅ Fetch product (Improved error handling and state management)
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  // Use useMemo for derived states
  const { images, inStock, discount } = useMemo(() => {
    if (!product) return { images: ['/placeholder.jpg'], inStock: false, discount: 0 };

    const images = product.images?.length ? product.images : ['/placeholder.jpg'];
    const inStock = product.stock > 0;
    const discount = product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;
    
    return { images, inStock, discount };
  }, [product]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(quantity + value, product.stock || 1));
    setQuantity(newQuantity);
  };

  // ✅ Add to cart (Simplified and consistent with utility)
  const addToCart = () => {
    if (isSupplier) return;
    const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const existing = cart.find((item) => item.id === product.id);

    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });

    localStorage.setItem(cartKey, JSON.stringify(cart));
    toast.success(`${product.name} added to cart 🛒`, { duration: 1500 });
  };

  // ✅ Handle Buy Now (Refined logic and UI feedback)
  const handleBuyNow = () => {
    if (isSupplier) return;

    // Save current product/quantity to local storage for immediate checkout
    const checkoutItem = { ...product, quantity };
    localStorage.setItem('checkoutItem', JSON.stringify(checkoutItem));

    // If not logged in -> redirect to login first
    if (!user || user.role !== 'user') {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      toast('🔒 Please log in to continue checkout.', { duration: 3000 });
      router.push('/login');
      return;
    }

    // Logged-in user -> go to checkout
    router.push('/checkout');
  };

  // --- Loading Skeleton (Improved Aesthetics) ---
  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="h-6 bg-gray-200 rounded w-1/5 mb-8 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="w-full">
             <div className="h-[500px] bg-gray-200 rounded-xl mb-4 animate-pulse"></div>
             <div className="flex gap-2 justify-start">
               {[...Array(4)].map((_, i) => <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>)}
             </div>
          </div>
          <div className="w-full">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
            <div className="h-16 bg-gray-200 rounded mb-8 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error || !product) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-extrabold text-red-600 mb-4">Product Not Found</h1>
        <p className="mb-8 text-lg text-gray-600">
          {error || "The product you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/products" className="inline-block">
          <Button className={ACCENT_COLOR}>Browse All Products</Button>
        </Link>
      </div>
    );
  }

  // --- Main Content ---
  return (
    <motion.div
      className="container mx-auto px-6 py-12"
      initial="hidden"
      animate="visible"
      variants={mainContentVariants}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-10" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
        <Link href="/products" className="hover:text-teal-600 transition-colors">Products</Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
        <span className="font-medium text-gray-700 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Images */}
        <div className="w-full">
          {/* Main Image View */}
          <div className="relative h-[500px] bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                variants={imageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
                aria-live="polite"
              >
                <Image
                  src={images[selectedImage]}
                  alt={`${product.name} - image ${selectedImage + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-4"
                  priority={selectedImage === 0} // Only prioritize the first load image
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex mt-6 gap-3 justify-center">
              {images.map((img, index) => (
                <motion.div
                  key={index}
                  className={`relative w-20 h-20 border rounded-lg cursor-pointer transition-all duration-300 shadow-md ${
                    selectedImage === index
                      ? 'border-teal-600 ring-2 ring-teal-300 scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedImage(index)}
                  whileHover={{ scale: 1.05 }}
                  role="button"
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & CTA */}
        <div className="w-full space-y-8">
          <header className="space-y-3">
             <h1 className={`text-4xl font-extrabold ${PRIMARY_COLOR}`}>{product.name}</h1>
             
             {/* Rating and Reviews */}
             <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm font-medium">
                  {product.rating?.toFixed(1)} ({Math.floor(product.rating * 10)} reviews)
                </span>
             </div>
          </header>

          {/* Price */}
          <div className="space-y-2">
            {product.discountPrice ? (
              <div className="flex items-center">
                <span className={`text-4xl font-black ${ACCENT_TEXT}`}>
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="ml-4 text-2xl text-gray-500 line-through font-light">
                  {formatPrice(product.price)}
                </span>
                <span className="ml-4 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  Save {discount}%
                </span>
              </div>
            ) : (
              <span className={`text-4xl font-black ${ACCENT_TEXT}`}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-lg text-gray-700 leading-relaxed border-b border-gray-100 pb-8">
            {product.description || 'This high-quality product is built with the latest technology to ensure durability and performance. Experience the difference today!'}
          </p>

          {/* Quantity and Stock */}
          <div className="flex items-center space-x-6">
            <span className={`text-gray-700 font-semibold ${PRIMARY_COLOR}`}>Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-full shadow-sm">
              <button
                className={`p-3 rounded-l-full disabled:opacity-50 hover:bg-gray-100 transition ${ACCENT_TEXT}`}
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-5 py-2 font-semibold text-lg border-x">{quantity}</span>
              <button
                className={`p-3 rounded-r-full disabled:opacity-50 hover:bg-gray-100 transition ${ACCENT_TEXT}`}
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span
              className={`font-bold text-sm uppercase ${inStock ? 'text-green-600' : 'text-red-500'}`}
            >
              {inStock ? `${product.stock} in Stock` : 'Out of Stock'}
            </span>
          </div>

          {/* ✅ CTA Buttons (Hidden for suppliers) */}
          {!isSupplier && (
            <div className="pt-4 space-y-4">
              <Button
                className={`w-full py-4 text-xl font-bold ${ACCENT_COLOR} shadow-lg shadow-teal-200/50 transition-transform hover:scale-[1.005]`}
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                <Truck className="mr-3 h-5 w-5" />
                Buy Now
              </Button>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className={`flex-1 py-3 border-teal-500 ${ACCENT_TEXT} hover:bg-teal-50 font-semibold transition-transform`}
                  onClick={addToCart}
                  disabled={!inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="px-4 py-3 border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="px-4 py-3 border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Detailed Features / Guarantees */}
          <div className="pt-8 border-t border-gray-100 grid grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-gray-700 font-medium">
            <div className="flex items-center space-x-2">
              <Truck className={`h-5 w-5 ${ACCENT_TEXT}`} />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className={`h-5 w-5 ${ACCENT_TEXT}`} />
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className={`h-5 w-5 ${ACCENT_TEXT}`} />
              <span>2-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Specification/Details Section (Future Tabs) */}
      <section className="mt-20 border-t border-gray-200 pt-10">
        <h2 className={`text-3xl font-bold mb-6 ${PRIMARY_COLOR}`}>Product Specifications</h2>
        
        {/* Simple mock-up for specs, replace with actual data rendering */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-gray-700">
            <div className="flex justify-between border-b py-2">
                <span className="font-semibold">Category:</span>
                <span>{product.category || 'Electronics'}</span>
            </div>
            <div className="flex justify-between border-b py-2">
                <span className="font-semibold">Supplier ID:</span>
                <span>{product.supplierId || 'S-9876'}</span>
            </div>
            <div className="flex justify-between border-b py-2">
                <span className="font-semibold">Weight:</span>
                <span>{product.weight || '0.5 kg'}</span>
            </div>
            <div className="flex justify-between border-b py-2">
                <span className="font-semibold">Material:</span>
                <span>{product.material || 'Aluminum Alloy'}</span>
            </div>
        </div>
      </section>
      
    </motion.div>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useParams, useRouter } from 'next/navigation';
// import { toast } from 'react-hot-toast';
// import {
//   Star,
//   ShoppingCart,
//   Heart,
//   Share2,
//   ChevronRight,
//   Truck,
//   RotateCcw,
//   Shield,
// } from 'lucide-react';
// import { Button } from '@/components/button';
// import { formatPrice } from '@/utils/formatPrice';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '../../../contexts/AuthContext';

// export default function ProductDetails() {
//   const params = useParams();
//   const router = useRouter();
//   const { user } = useAuth(); // ✅ access logged-in user
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);

//   const isSupplier = user?.role === 'supplier';

//   // ✅ Fetch product
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await fetch(`/api/products/${params.id}`);
//         if (!res.ok) throw new Error('Product not found');
//         const data = await res.json();
//         setProduct(data);
//       } catch (err) {
//         console.error(err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProduct();
//   }, [params.id]);

//   // ✅ Loading skeleton
//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8 animate-pulse">
//         <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//         <div className="flex flex-col md:flex-row gap-8">
//           <div className="w-full md:w-1/2 h-96 bg-gray-200 rounded"></div>
//           <div className="w-full md:w-1/2">
//             <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
//             <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
//             <div className="h-24 bg-gray-200 rounded mb-6"></div>
//             <div className="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !product) {
//     return (
//       <div className="container mx-auto px-4 py-16 text-center">
//         <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
//         <p className="mb-8 text-gray-600">
//           {error || "The product you're looking for doesn't exist or has been removed."}
//         </p>
//         <Link href="/products">
//           <Button>Browse All Products</Button>
//         </Link>
//       </div>
//     );
//   }

//   const images = product.images?.length ? product.images : ['/placeholder.jpg'];
//   const inStock = product.stock > 0;
//   const discount = product.discountPrice
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : 0;

//   const handleQuantityChange = (value) => {
//     const newQuantity = Math.max(1, Math.min(quantity + value, product.stock || 1));
//     setQuantity(newQuantity);
//   };

//   // ✅ Add to cart with localStorage
//   const addToCart = () => {
//     if (isSupplier) return; // supplier can't add
//     const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
//     const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
//     const existing = cart.find((item) => item.id === product.id);

//     if (existing) existing.quantity += quantity;
//     else cart.push({ ...product, quantity });

//     localStorage.setItem(cartKey, JSON.stringify(cart));
//     toast.success(`${product.name} added to cart 🛒`);
//   };

//   // ✅ Handle Buy Now
//   const handleBuyNow = () => {
//     if (isSupplier) return; // supplier can't buy

//     const checkoutProduct = { ...product, quantity };

//     // Save to user's cart
//     const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
//     const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
//     const exists = cart.find((item) => item.id === product.id);
//     if (!exists) cart.push(checkoutProduct);
//     localStorage.setItem(cartKey, JSON.stringify(cart));

//     // If not logged in → redirect to login first
//     if (!user || user.role !== 'user') {
//       localStorage.setItem('redirectAfterLogin', '/checkout');
//       toast('Please login to continue checkout', { icon: '🔒' });
//       router.push('/login');
//       return;
//     }

//     // ✅ Logged-in user → go to checkout
//     localStorage.setItem('checkoutItem', JSON.stringify(checkoutProduct));
//     router.push('/checkout');
//   };

//   return (
//     <motion.div
//       className="container mx-auto px-4 py-8"
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, ease: 'easeOut' }}
//     >
//       {/* Breadcrumb */}
//       <div className="flex items-center text-sm text-gray-500 mb-8">
//         <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
//         <ChevronRight className="h-4 w-4 mx-2" />
//         <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
//         <ChevronRight className="h-4 w-4 mx-2" />
//         <span className="text-gray-700">{product.name}</span>
//       </div>

//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Images */}
//         <div className="w-full md:w-1/2">
//           <div className="relative h-96 bg-white rounded-lg overflow-hidden border">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={selectedImage}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//                 className="absolute inset-0"
//               >
//                 <Image
//                   src={images[selectedImage]}
//                   alt={product.name}
//                   fill
//                   className="object-contain"
//                   priority
//                 />
//               </motion.div>
//             </AnimatePresence>
//           </div>

//           {images.length > 1 && (
//             <div className="flex mt-4 gap-2 justify-center">
//               {images.map((img, index) => (
//                 <div
//                   key={index}
//                   className={`relative w-20 h-20 border rounded cursor-pointer transition-all duration-200 hover:scale-105 ${
//                     selectedImage === index
//                       ? 'border-blue-500 ring-2 ring-blue-300'
//                       : 'border-gray-200'
//                   }`}
//                   onClick={() => setSelectedImage(index)}
//                 >
//                   <Image
//                     src={img}
//                     alt={`${product.name} - ${index + 1}`}
//                     fill
//                     className="object-contain"
//                   />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Info */}
//         <div className="w-full md:w-1/2">
//           <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

//           {/* Rating */}
//           <div className="flex items-center mb-4">
//             <div className="flex">
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className={`h-5 w-5 transition-colors ${
//                     i < Math.floor(product.rating)
//                       ? 'text-yellow-400 fill-yellow-400'
//                       : 'text-gray-300'
//                   }`}
//                 />
//               ))}
//             </div>
//             <span className="ml-2 text-gray-600">
//               {product.rating?.toFixed(1)} ({Math.floor(product.rating * 10)} reviews)
//             </span>
//           </div>

//           {/* Price */}
//           <div className="mb-6">
//             {product.discountPrice ? (
//               <div className="flex items-center">
//                 <span className="text-3xl font-bold text-blue-600">
//                   {formatPrice(product.discountPrice)}
//                 </span>
//                 <span className="ml-3 text-xl text-gray-500 line-through">
//                   {formatPrice(product.price)}
//                 </span>
//                 <span className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
//                   {discount}% OFF
//                 </span>
//               </div>
//             ) : (
//               <span className="text-3xl font-bold text-blue-600">
//                 {formatPrice(product.price)}
//               </span>
//             )}
//           </div>

//           {/* Description */}
//           <p className="text-gray-700 mb-6 leading-relaxed">
//             {product.description || 'High-quality product built to last.'}
//           </p>

//           {/* Quantity */}
//           <div className="flex items-center mb-6">
//             <span className="mr-4 text-gray-700 font-medium">Quantity:</span>
//             <div className="flex items-center border rounded-md shadow-sm">
//               <button
//                 className="px-3 py-1 border-r disabled:opacity-50 hover:bg-gray-100 transition"
//                 onClick={() => handleQuantityChange(-1)}
//                 disabled={quantity <= 1}
//               >
//                 −
//               </button>
//               <span className="px-4 py-1">{quantity}</span>
//               <button
//                 className="px-3 py-1 border-l disabled:opacity-50 hover:bg-gray-100 transition"
//                 onClick={() => handleQuantityChange(1)}
//                 disabled={quantity >= product.stock}
//               >
//                 +
//               </button>
//             </div>
//             <span
//               className={`ml-4 font-semibold ${inStock ? 'text-green-600' : 'text-red-500'}`}
//             >
//               {inStock ? 'In Stock' : 'Out of Stock'}
//             </span>
//           </div>

//           {/* ✅ Hide for suppliers */}
//           {!isSupplier && (
//             <>
//               <div className="flex flex-wrap gap-4 mb-4">
//                 <Button
//                   className="flex-1 py-3 transition-transform hover:scale-[1.02]"
//                   onClick={addToCart}
//                   disabled={!inStock}
//                 >
//                   <ShoppingCart className="mr-2 h-5 w-5" />
//                   Add to Cart
//                 </Button>
//                 <Button variant="outline" className="px-4 py-3 hover:bg-gray-50">
//                   <Heart className="h-5 w-5" />
//                 </Button>
//                 <Button variant="outline" className="px-4 py-3 hover:bg-gray-50">
//                   <Share2 className="h-5 w-5" />
//                 </Button>
//               </div>

//               <Button
//                 className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-transform hover:scale-[1.02]"
//                 onClick={handleBuyNow}
//                 disabled={!inStock}
//               >
//                 Buy Now
//               </Button>
//             </>
//           )}

//           {/* Features */}
//           <div className="border-t pt-6 mt-6 text-sm text-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="flex items-center">
//               <Truck className="h-5 w-5 text-blue-600 mr-2" /> Free Shipping
//             </div>
//             <div className="flex items-center">
//               <RotateCcw className="h-5 w-5 text-blue-600 mr-2" /> 30-Day Returns
//             </div>
//             <div className="flex items-center">
//               <Shield className="h-5 w-5 text-blue-600 mr-2" /> 2-Year Warranty
//             </div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
