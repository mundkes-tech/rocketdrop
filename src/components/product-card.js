'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ShoppingCart, Star, CheckCircle2 } from 'lucide-react';
import Lottie from 'lottie-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAddToCart }) {  const [isAnimating, setIsAnimating] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animationRef = useRef(null);

  // Load Lottie animation
  useEffect(() => {
    fetch('/lottie/add-to-cart-success.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(() => setAnimationData(null));
  }, []);

  const handleAddToCart = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    await onAddToCart(product);
    setTimeout(() => setIsAnimating(false), 1500);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white flex flex-col"
    >
      {/* Product Image with shimmer + fade-in */}
      <div className="relative w-full h-64 bg-gray-50 overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.imageUrl || '/images/products/placeholder.svg'}
            alt={product.name || 'Product image'}
            fill
            onLoadingComplete={() => setImageLoaded(true)}
            className={`object-cover group-hover:scale-110 transition-all duration-700 ease-out ${
              imageLoaded ? 'opacity-100 blur-0' : 'opacity-60 blur-sm'
            }`}
            placeholder="blur"
            // Shimmer placeholder (tiny inline SVG)
            blurDataURL={`data:image/svg+xml;base64,${btoa(`
              <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="300" fill="#f6f7f8"/>
                <rect id="r" width="400" height="300" fill="#eee"/>
                <animate xlink:href="#r" attributeName="x" from="-400" to="400" dur="1.2s" repeatCount="indefinite" />
              </svg>
            `)}`}
          />
        </Link>

        {/* Discount badge */}
        {product.discountPrice && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-1 truncate hover:text-[#004a7c] transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[#004a7c] font-bold text-lg">
              ${product.discountPrice ?? product.price}
            </span>
            {product.discountPrice && (
              <span className="text-gray-400 text-sm line-through ml-2">
                ${product.price}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={16} fill="currentColor" />
            <span className="text-sm text-gray-700">{product.rating ?? '4.5'}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          whileTap={{ scale: 0.95 }}
          disabled={isAnimating}
          className={`relative mt-auto flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
            isAnimating
              ? 'bg-green-600 text-white cursor-wait'
              : 'bg-gradient-to-r from-[#004a7c] to-[#005691] hover:opacity-90 text-white'
          }`}
        >
          {isAnimating && animationData ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lottie
                lottieRef={animationRef}
                animationData={animationData}
                loop={false}
                autoplay={true}
                style={{ width: 60, height: 60 }}
              />
            </div>
          ) : isAnimating ? (
            <>
              <CheckCircle2 size={18} /> Added!
            </>
          ) : (
            <>
              <ShoppingCart size={18} /> Add to Cart
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}



// 'use client';
// import { useState, useEffect, useRef } from 'react';
// import Image from 'next/image';
// import { ShoppingCart, Star } from 'lucide-react';
// import Lottie from 'lottie-react';
// import Link from 'next/link';


// export function ProductCard({ product, onAddToCart }) {
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [animationData, setAnimationData] = useState(null);
//   const animationRef = useRef(null);

//   // ✅ Load Lottie JSON dynamically from /public
//   useEffect(() => {
//     fetch('/lottie/add-to-cart-success.json')
//       .then((res) => res.json())
//       .then((data) => setAnimationData(data))
//       .catch((err) => console.error('Error loading animation:', err));
//   }, []);

//   const handleAddToCart = async () => {
//     setIsAnimating(true);
//     onAddToCart(product);
//     setTimeout(() => setIsAnimating(false), 1500);
//   };

//   return (
//     <div className="group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white flex flex-col">
//       <div className="relative w-full h-64 bg-gray-100">
//       <Link href={`/products/${product.id}`}>
//         <Image
//           src={product.imageUrl || '/images/products/placeholder.svg'}
//           alt={product.name || 'Product image'}
//           fill
//           className="object-cover group-hover:scale-110 transition-transform duration-500"
//         />
//       </Link>
//       </div>

//       <div className="p-4 flex-1 flex flex-col">
//         <Link href={`/products/${product.id}`}>
//           <h3 className="font-semibold text-lg mb-1 truncate hover:text-blue-600 transition">
//             {product.name}
//           </h3>
//         </Link>
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <span className="text-indigo-600 font-bold text-lg">
//               ${product.discountPrice ?? product.price}
//             </span>
//             {product.discountPrice && (
//               <span className="text-gray-400 text-sm line-through ml-2">
//                 ${product.price}
//               </span>
//             )}
//           </div>
//           <div className="flex items-center gap-1 text-yellow-500">
//             <Star size={16} fill="currentColor" />
//             <span className="text-sm text-gray-700">{product.rating}</span>
//           </div>
//         </div>

//         <button
//           onClick={handleAddToCart}
//           className="relative mt-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#004a7c] to-[#005691] text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
//         >
//           {isAnimating && animationData ? (
//             <div className="absolute inset-0 flex items-center justify-center">
//               <Lottie
//                 lottieRef={animationRef}
//                 animationData={animationData}
//                 loop={false}
//                 autoplay={true}
//                 style={{ width: 50, height: 50 }}
//               />
//             </div>
//           ) : (
//             <>
//               <ShoppingCart size={18} /> Add to Cart
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }
