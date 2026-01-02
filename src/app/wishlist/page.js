'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import { Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartContext } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/formatPrice';
import { motion } from 'framer-motion';

const fetcher = (url) => fetch(url, { credentials: 'include' }).then((res) => res.json());

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCartContext();
  const { data, mutate, error } = useSWR(
    user ? '/api/wishlists' : null,
    fetcher
  );

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleRemove = async (productId) => {
    try {
      const res = await fetch(`/api/wishlists?product_id=${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Removed from wishlist');
        mutate();
      } else {
        toast.error('Failed to remove from wishlist');
      }
    } catch (error) {
      toast.error('Error removing from wishlist');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // Create cart item with proper structure
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        discountPrice: product.discountPrice,
        quantity: 1,
        images: product.images,
        stock: product.stock
      };
      
      await addToCart(cartItem, user);
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (!user) {
    return <div className="container mx-auto px-6 py-12 text-center">Loading...</div>;
  }

  const items = data?.items || [];

  return (
    <motion.div
      className="container mx-auto px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
        <span className="text-gray-700 font-medium">My Wishlist</span>
      </nav>

      <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4 text-lg">Your wishlist is empty</p>
          <Link href="/products">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Continue Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-6">{items.length} item(s) in your wishlist</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => (
              <motion.div
                key={product.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                whileHover={{ y: -5 }}
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">{product.name}</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.discountPrice ? (
                        <>
                          <p className="text-indigo-600 font-bold">
                            {formatPrice(product.discountPrice)}
                          </p>
                          <p className="text-gray-500 line-through text-sm">
                            {formatPrice(product.price)}
                          </p>
                        </>
                      ) : (
                        <p className="text-indigo-600 font-bold">
                          {formatPrice(product.price)}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="w-full px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                    <Link href={`/products/${product.id}`}>
                      <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
