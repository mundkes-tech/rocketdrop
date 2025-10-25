// src/app/page.js
'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserDashboard from '@/app/user-dashboard/page';

export default function HomePage() {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      <UserDashboard />
    </ProtectedRoute>
  );
}




// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { ArrowRight, TrendingUp, Sparkles, ShoppingBag } from 'lucide-react';
// import { Button } from '@/components/button';
// import { ProductCard } from '@/components/product-card';
// import { products, categories } from '@/lib/mock-data';

// export default function HomePage() {
//   const featuredProducts = products.filter((p) => p.featured);
//   const trendingProducts = products.filter((p) => p.trending);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900">
//       {/* Hero Section */}
//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 opacity-70 blur-3xl" />
//         <div className="container mx-auto px-4 py-20 md:py-32 text-center relative z-10">
//           <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
//             <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md shadow-sm text-indigo-700 rounded-full px-5 py-2 mb-6">
//               <Sparkles className="h-4 w-4 text-pink-500" />
//               <span className="text-sm font-semibold">
//                 New Season Sale - Up to 50% Off
//               </span>
//             </div>

//             <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
//               Discover{' '}
//               <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
//                 Stunning Products
//               </span>
//             </h1>

//             <p className="text-lg md:text-xl mb-10 text-gray-600">
//               Shop the latest trends with fast delivery, premium quality, and exclusive deals every week.
//             </p>

//             <div className="flex flex-col sm:flex-row justify-center gap-4">
//               <Button
//                 size="lg"
//                 className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 text-white text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300"
//               >
//                 <Link href="/products" className="flex items-center">
//                   Shop Now <ArrowRight className="ml-2 h-5 w-5" />
//                 </Link>
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="border-indigo-500 text-indigo-600 hover:bg-indigo-100/40 text-lg px-8 transition-all duration-300"
//               >
//                 <Link href="/deals">View Deals</Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Categories Section */}
//       <section className="py-20 bg-white/60 backdrop-blur-md">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
//             Shop by Categories
//           </h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
//             {categories.map((category) => (
//               <Link key={category.id} href={`/category/${category.slug}`} className="group">
//                 <div className="relative aspect-square rounded-3xl overflow-hidden bg-indigo-100 shadow-md transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
//                   <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//                   <div className="absolute bottom-3 left-3 right-3 text-white text-center">
//                     <h3 className="font-semibold text-sm">{category.name}</h3>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Featured Products */}
//       <section className="py-20 bg-gradient-to-br from-white via-indigo-50 to-pink-50">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
//                 <Sparkles className="h-8 w-8 text-pink-500" />
//                 Featured Products
//               </h2>
//               <p className="text-gray-600">Hand-picked favorites just for you</p>
//             </div>
//             <Button variant="ghost" asChild>
//               <Link href="/products" className="flex items-center text-indigo-600">
//                 View All <ArrowRight className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//             {featuredProducts.map((product) => (
//               <div key={product.id} className="hover:scale-105 transition-all duration-300">
//                 <ProductCard product={product} />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Trending Section */}
//       <section className="py-20 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">
//                 <TrendingUp className="h-8 w-8 text-pink-500" />
//                 Trending Now
//               </h2>
//               <p className="text-gray-600">Most popular items this week</p>
//             </div>
//             <Button variant="ghost" asChild>
//               <Link href="/products" className="flex items-center text-pink-500">
//                 View All <ArrowRight className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//             {trendingProducts.map((product) => (
//               <div key={product.id} className="hover:scale-105 transition-all duration-300">
//                 <ProductCard product={product} />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Newsletter */}
//       <section className="py-20 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
//         <div className="container mx-auto px-4 text-center">
//           <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-lg">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
//               Stay Updated
//             </h2>
//             <p className="text-gray-600 mb-8">
//               Subscribe to our newsletter for exclusive deals and updates
//             </p>
//             <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
//               <input
//                 type="email"
//                 placeholder="Your email address"
//                 className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//               <Button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 text-white shadow-lg transition-all duration-300">
//                 Subscribe
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }
