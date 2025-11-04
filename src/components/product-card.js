'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import Lottie from 'lottie-react';
import Link from 'next/link';


export function ProductCard({ product, onAddToCart }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const animationRef = useRef(null);

  // ✅ Load Lottie JSON dynamically from /public
  useEffect(() => {
    fetch('/lottie/add-to-cart-success.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Error loading animation:', err));
  }, []);

  const handleAddToCart = async () => {
    setIsAnimating(true);
    onAddToCart(product);
    setTimeout(() => setIsAnimating(false), 1500);
  };

  return (
    <div className="group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white flex flex-col">
      <div className="relative w-full h-64 bg-gray-100">
      <Link href={`/products/${product.id}`}>
        <Image
          src={product.imageUrl || '/images/products/placeholder.svg'}
          alt={product.name || 'Product image'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </Link>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-1 truncate hover:text-blue-600 transition">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-indigo-600 font-bold text-lg">
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
            <span className="text-sm text-gray-700">{product.rating}</span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="relative mt-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#004a7c] to-[#005691] text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
        >
          {isAnimating && animationData ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Lottie
                lottieRef={animationRef}
                animationData={animationData}
                loop={false}
                autoplay={true}
                style={{ width: 50, height: 50 }}
              />
            </div>
          ) : (
            <>
              <ShoppingCart size={18} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
