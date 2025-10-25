'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/button';
import { ProductCard } from '@/components/product-card';
import { products, categories } from '@/lib/mock-data';

export default function UserDashboard() {
  const featuredProducts = products.filter((p) => p.featured);
  const trendingProducts = products.filter((p) => p.trending);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D7C6BC] via-[#48657B] to-[#19384B] text-gray-900">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#19384B] via-[#2C5670] to-[#48657B] opacity-90" />
        <div className="container mx-auto px-4 py-24 md:py-36 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg shadow-lg text-white rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-5 w-5 animate-pulse text-[#D7C6BC]" />
              <span className="text-sm font-semibold tracking-wide uppercase">
                New Season Sale - Up to 50% Off
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight text-white">
              Shop Smart with{' '}
              <span className="text-[#D7C6BC]">
                Global Dropshipping
              </span>
            </h1>

            <p className="text-lg md:text-xl mb-10 text-[#F5DEB3]/90 max-w-2xl mx-auto">
              Discover handpicked products from trusted global suppliers — shipped directly to your door.
            </p>


            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button className="bg-gradient-to-r from-[#2C5670] to-[#48657B] hover:from-[#48657B] hover:to-[#2C5670] text-white px-10 py-4 text-lg rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Link href="/products" className="flex items-center gap-2">
                  Shop Now <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button className="bg-[#D7C6BC] hover:bg-[#C6B7AD] text-[#19384B] px-10 py-4 text-lg rounded-full shadow-2xl transition-all duration-300">
                <Link href="/deals">View Deals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[#D7C6BC]/40 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-[#19384B] to-[#2C5670] bg-clip-text text-transparent">
            Shop by Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="group">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#19384B] to-[#2C5670] shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-center">
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-[#D7C6BC] via-[#48657B] to-[#2C5670]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-[#19384B] to-[#2C5670] bg-clip-text text-transparent">
                <Sparkles className="h-8 w-8 text-[#2C5670]" />
                Featured Products
              </h2>
              <p className="text-gray-200">Hand-picked favorites just for you</p>
            </div>
            <Link href="/products" className="flex items-center text-[#D7C6BC] font-semibold hover:underline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="hover:scale-105 transition-transform duration-500 shadow-lg rounded-3xl overflow-hidden border-2 border-transparent hover:border-[#D7C6BC]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20 bg-[#D7C6BC]/40 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-[#19384B] to-[#48657B] bg-clip-text text-transparent">
                <TrendingUp className="h-8 w-8 text-[#2C5670]" />
                Trending Now
              </h2>
              <p className="text-gray-700">Most popular items this week</p>
            </div>
            <Link href="/products" className="flex items-center text-[#19384B] font-semibold hover:underline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts.map((product) => (
              <div
                key={product.id}
                className="hover:scale-105 transition-transform duration-500 shadow-lg rounded-3xl overflow-hidden border-2 border-transparent hover:border-[#2C5670]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-[#D7C6BC] via-[#48657B] to-[#19384B]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#19384B] to-[#2C5670] bg-clip-text text-transparent">
              Stay Updated
            </h2>
            <p className="text-gray-700 mb-8">
              Subscribe to our newsletter for exclusive deals and updates
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2C5670]"
              />
              <Button className="px-6 py-3 bg-gradient-to-r from-[#2C5670] to-[#48657B] hover:from-[#48657B] hover:to-[#2C5670] text-white rounded-full shadow-xl transition-all duration-300 transform hover:scale-105">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
