'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/button';
import { formatPrice } from '@/utils/formatPrice';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext'; // ✅ Import auth context

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth(); // ✅ access logged-in user
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const isSupplier = user?.role === 'supplier';

  // ✅ Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
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

  // ✅ Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 h-96 bg-gray-200 rounded"></div>
          <div className="w-full md:w-1/2">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-24 bg-gray-200 rounded mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-8 text-gray-600">
          {error || "The product you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/products">
          <Button>Browse All Products</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['/placeholder.jpg'];
  const inStock = product.stock > 0;
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(quantity + value, product.stock || 1));
    setQuantity(newQuantity);
  };

  // ✅ Add to cart with localStorage
  const addToCart = () => {
    if (isSupplier) return; // supplier can't add
    const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const existing = cart.find((item) => item.id === product.id);

    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });

    localStorage.setItem(cartKey, JSON.stringify(cart));
    toast.success(`${product.name} added to cart 🛒`);
  };

  // ✅ Handle Buy Now
  const handleBuyNow = () => {
    if (isSupplier) return; // supplier can't buy

    const checkoutProduct = { ...product, quantity };

    // Save to user's cart
    const cartKey = user?.email ? `cart_${user.email}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const exists = cart.find((item) => item.id === product.id);
    if (!exists) cart.push(checkoutProduct);
    localStorage.setItem(cartKey, JSON.stringify(cart));

    // If not logged in → redirect to login first
    if (!user || user.role !== 'user') {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      toast('Please login to continue checkout', { icon: '🔒' });
      router.push('/login');
      return;
    }

    // ✅ Logged-in user → go to checkout
    localStorage.setItem('checkoutItem', JSON.stringify(checkoutProduct));
    router.push('/checkout');
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-700">{product.name}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Images */}
        <div className="w-full md:w-1/2">
          <div className="relative h-96 bg-white rounded-lg overflow-hidden border">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <div className="flex mt-4 gap-2 justify-center">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`relative w-20 h-20 border rounded cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedImage === index
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 transition-colors ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.rating?.toFixed(1)} ({Math.floor(product.rating * 10)} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            {product.discountPrice ? (
              <div className="flex items-center">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="ml-3 text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {discount}% OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description || 'High-quality product built to last.'}
          </p>

          {/* Quantity */}
          <div className="flex items-center mb-6">
            <span className="mr-4 text-gray-700 font-medium">Quantity:</span>
            <div className="flex items-center border rounded-md shadow-sm">
              <button
                className="px-3 py-1 border-r disabled:opacity-50 hover:bg-gray-100 transition"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button
                className="px-3 py-1 border-l disabled:opacity-50 hover:bg-gray-100 transition"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <span
              className={`ml-4 font-semibold ${inStock ? 'text-green-600' : 'text-red-500'}`}
            >
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* ✅ Hide for suppliers */}
          {!isSupplier && (
            <>
              <div className="flex flex-wrap gap-4 mb-4">
                <Button
                  className="flex-1 py-3 transition-transform hover:scale-[1.02]"
                  onClick={addToCart}
                  disabled={!inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" className="px-4 py-3 hover:bg-gray-50">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="px-4 py-3 hover:bg-gray-50">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <Button
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-transform hover:scale-[1.02]"
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                Buy Now
              </Button>
            </>
          )}

          {/* Features */}
          <div className="border-t pt-6 mt-6 text-sm text-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-blue-600 mr-2" /> Free Shipping
            </div>
            <div className="flex items-center">
              <RotateCcw className="h-5 w-5 text-blue-600 mr-2" /> 30-Day Returns
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" /> 2-Year Warranty
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useParams, useRouter } from 'next/navigation';
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

// export default function ProductDetails() {
//   const params = useParams();
//   const router = useRouter();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);

//   // Fetch product data dynamically
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

//   // Handle loading state (Skeleton UI)
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

//   // Handle error state
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

//   // Derived values
//   const images = product.images?.length ? product.images : ['/placeholder.jpg'];
//   const inStock = product.stock > 0;
//   const discount = product.discountPrice
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : 0;

//   const handleQuantityChange = (value) => {
//     const newQuantity = Math.max(1, Math.min(quantity + value, product.stock || 1));
//     setQuantity(newQuantity);
//   };

//   const addToCart = () => {
//     console.log('Added to cart:', { ...product, quantity });
//     alert(`✅ ${quantity} × ${product.name} added to cart!`);
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
//         {product.category && (
//           <>
//             <ChevronRight className="h-4 w-4 mx-2" />
//             <Link
//               href={`/category/${product.category?.toLowerCase()}`}
//               className="hover:text-blue-600 transition-colors"
//             >
//               {product.category}
//             </Link>
//           </>
//         )}
//         <ChevronRight className="h-4 w-4 mx-2" />
//         <span className="text-gray-700">{product.name}</span>
//       </div>

//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Product Images */}
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

//         {/* Product Info */}
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
//             {product.description ||
//               `This premium ${product.category?.toLowerCase() || ''} offers exceptional quality and performance.`}
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
//               className={`ml-4 font-semibold ${
//                 inStock ? 'text-green-600' : 'text-red-500'
//               }`}
//             >
//               {inStock ? 'In Stock' : 'Out of Stock'}
//             </span>
//           </div>

//           {/* Actions */}
//           <div className="flex flex-wrap gap-4 mb-4">
//             <Button
//               className="flex-1 py-3 transition-transform hover:scale-[1.02]"
//               onClick={addToCart}
//               disabled={!inStock}
//             >
//               <ShoppingCart className="mr-2 h-5 w-5" />
//               Add to Cart
//             </Button>
//             <Button variant="outline" className="px-4 py-3 hover:bg-gray-50">
//               <Heart className="h-5 w-5" />
//             </Button>
//             <Button variant="outline" className="px-4 py-3 hover:bg-gray-50">
//               <Share2 className="h-5 w-5" />
//             </Button>
//           </div>

//           {/* Buy Now */}
//           <Button
//             className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-transform hover:scale-[1.02]"
//             onClick={() => {
//               const checkoutProduct = { ...product, quantity };
//               localStorage.setItem('checkoutItem', JSON.stringify(checkoutProduct));
//               router.push('/checkout');
//             }}
//             disabled={!inStock}
//           >
//             Buy Now
//           </Button>

//           {/* Product Benefits */}
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

//       {/* Product Details */}
//       <div className="mt-16 border-t pt-8">
//         <h2 className="text-2xl font-bold mb-6">Product Details</h2>
//         <p className="text-gray-700 leading-relaxed">
//           {product.longDescription ||
//             `The ${product.name} is crafted with precision using high-quality materials. 
//             Designed for durability and performance, it’s perfect for everyday use.`}
//         </p>
//       </div>
//     </motion.div>
//   );
// }

