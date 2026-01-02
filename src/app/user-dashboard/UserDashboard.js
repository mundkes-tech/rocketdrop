'use client';

import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Sparkles, Mail } from 'lucide-react'; 
import { Button } from '@/components/button';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/skeleton';
import { toast } from 'react-hot-toast';

// --- Global Design/UX Constants ---
const PRIMARY_COLOR = '#19384B'; // Deep Blue/Charcoal - Primary Text/Background Accent
const ACCENT_COLOR = '#48657B'; // Mid-tone Blue - Secondary Accent/CTA Hover
const TERTIARY_COLOR = '#D7C6BC'; // Light Earth/Stone - Background/Highlight
const TEXT_DARK = PRIMARY_COLOR;
const TEXT_LIGHT = '#FFFFFF';
const BORDER_COLOR = 'border-gray-200';

// Lazy load product card for better performance
const ProductCard = dynamic(() => import('@/components/product-card'), { ssr: false });

const fetcher = (url) =>
  fetch(url, {
    credentials: 'include', // Include cookies for authentication
  })
    .then(async (r) => {
      if (!r.ok) {
        // Log more detail to the console
        const err = await r.text();
        console.error('❌ API Error:', r.status, err);
        throw new Error(err || `Fetch error with status: ${r.status}`);
      }
      return r.json();
    })
    .catch((err) => {
      console.error('❌ Fetch failed:', err);
      // SWR will handle the error state, returning null here is correct for useSWR
      return null;
    });

// Framer Motion Variants
const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function UserDashboardPage() {
  const [email, setEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  // ✅ Data Fetching (SWR)
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useSWR('/api/products?page=1&limit=12', fetcher);

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useSWR('/api/categories', fetcher);

  // ✅ Defensive Data Handling
  const products = Array.isArray(productsData?.products)
    ? productsData.products
    : [];
  const categories = Array.isArray(categoriesData?.categories)
    ? categoriesData.categories
    : [];

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4); // Limit to 4 for better layout focus
  const trendingProducts = [...products]
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 4); // Limit to 4 for better layout focus

  // ✅ Newsletter Submit
  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      setNewsletterMessage('⚠️ Please enter a valid email.');
      return;
    }

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Subscribed successfully 🎉');
        setEmail('');
        setNewsletterMessage(''); // Clear message after success
      } else {
        toast.error(data.error || 'Subscription failed.');
        setNewsletterMessage(data.error || 'Subscription failed.');
      }
    } catch (err) {
      console.error('❌ Newsletter error:', err);
      toast.error('Server error. Try again later.');
      setNewsletterMessage('Server error. Try again later.');
    }
  };

  // ✅ Unified Loading State with improved skeleton design
  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen pt-40 bg-white">
        <div className="container mx-auto px-4">
          <Skeleton className="w-80 h-12 rounded-lg mx-auto mb-20" />
          <h2 className="text-3xl font-bold mb-6">Loading Categories...</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={`cat-skel-${i}`} className="h-40 w-full rounded-2xl" />
            ))}
          </div>

          <h2 className="text-3xl font-bold mb-6">Loading Featured Products...</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={`prod-skel-${i}`} className="h-96 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Handle API Errors
  if (categoriesError || productsError) {
    console.error('❌ Error loading dashboard data:', {
      categoriesError,
      productsError,
    });
    toast.error('Failed to load content. Please check your connection.');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-white text-gray-700">
        <p className="text-xl font-medium mb-4">⚠️ Unable to load content</p>
        <p className="mb-6 text-sm text-gray-500">
          We&apos;re having trouble fetching the latest products.
        </p>
        <Button
          onClick={() => location.reload()}
          className={`px-8 py-3 bg-gradient-to-r from-[${PRIMARY_COLOR}] to-[${ACCENT_COLOR}] text-white rounded-full transition duration-300 hover:shadow-lg`}
        >
          Retry Loading
        </Button>
      </div>
    );
  }

  // ✅ Handle Empty Categories or Products
  if (categories.length === 0 && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-white text-gray-600">
        <Sparkles className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-xl font-semibold mb-2">
          No products or categories available
        </p>
        <p className="text-md text-gray-500">
          Our inventory is currently being updated. Please check back later!
        </p>
      </div>
    );
  }

  return (
    // Switched to a clean white background for the main body for high-end feel
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* 🌟 Hero Section - Elevated with high-contrast gradient background */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={`relative overflow-hidden text-white bg-gradient-to-br from-[#19384B] via-[#2C5670] to-[#48657B]`}
      >
        <div className="container mx-auto px-6 py-28 md:py-40 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Tagline improvement: Cleaner style, better contrast */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={`inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full px-5 py-2 mb-6 shadow-xl cursor-default`}
            >
              <Sparkles className="h-4 w-4 text-yellow-300 fill-yellow-300 animate-pulse" />
              <span className="text-sm font-medium tracking-wide">
                New Season Sale — Up to 50% Off
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              Curated Excellence.
              <br />
              Shop{' '}
              <span className={`text-[#D7C6BC] drop-shadow-lg`}>
                RocketDrop
              </span>{' '}
              Today.
            </h1>

            <p className="text-lg md:text-xl mb-12 text-[#F5DEB3]/90 max-w-3xl mx-auto font-light">
              Discover a selection of handpicked products from trusted global
              suppliers, delivered with speed and care.
            </p>

            {/* CTA Improvement: More prominent, clear visual hierarchy */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={stagger}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <motion.div variants={fadeIn}>
                {/* NOTE: asChild prop used here, requires fix in components/button.js */}
                <Button
                  asChild
                  className={`bg-[#D7C6BC] hover:bg-[#C6B7AD] text-[${PRIMARY_COLOR}] px-12 py-4 text-lg font-semibold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-[1.03] border-2 border-transparent`}
                >
                  <Link href="/products" className="flex items-center gap-2">
                    Start Shopping <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div variants={fadeIn}>
                {/* NOTE: asChild prop used here, requires fix in components/button.js */}
                <Button
                  asChild
                  variant="outline"
                  className={`border-2 border-white text-white hover:bg-white/10 px-12 py-4 text-lg font-medium rounded-full transition-all duration-300`}
                >
                  <Link href="/deals">Explore Deals</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      ---

      {/* 🛍 Categories - Cleaner background, focus on product imagery */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2
            className={`text-4xl font-extrabold mb-4 text-center text-[${PRIMARY_COLOR}]`}
          >
            Shop by Categories
          </h2>
          <p className="text-lg text-gray-500 mb-12 text-center max-w-2xl mx-auto">
            Explore our meticulously organized collections and find exactly what
            you need.
          </p>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <motion.div key={category.id} variants={fadeIn}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="group block"
                  >
                    <div
                      className={`relative aspect-square rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border ${BORDER_COLOR}`}
                    >
                      <Image
                        // Accessibility: Ensure alt text is descriptive
                        src={
                          category.imageUrl ||
                          '/images/categories/placeholder.svg'
                        }
                        alt={`Category image for ${category.name}`}
                        fill
                        // FIX APPLIED: Removed loading="lazy" to resolve conflict with priority. 
                        // Next.js automatically sets loading="eager" when priority is true.
                        priority={category.id < 3} 
                        sizes="(max-width: 768px) 50vw, 16vw"
                        placeholder="blur"
                        blurDataURL="/images/blur-placeholder.png"
                        className="object-cover transition-all duration-500 group-hover:opacity-80"
                      />
                      {/* Gradient overlay for better text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-bold text-lg leading-snug">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">
                No categories found at this time.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      ---

      {/* 🌟 Featured Products - Use light background for better focus */}
      <section className={`py-20 bg-[${TERTIARY_COLOR}]/30`}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className={`h-7 w-7 text-[${ACCENT_COLOR}]`} />
                <h2
                  className={`text-3xl md:text-4xl font-extrabold text-[${PRIMARY_COLOR}]`}
                >
                  Featured Products
                </h2>
              </div>
              <p className="text-lg text-gray-600">
                Hand-picked favorites from our expert curators.
              </p>
            </div>
            {/* Improved CTA link style */}
            <Link
              href="/products"
              className={`flex items-center text-[${PRIMARY_COLOR}] font-semibold hover:text-[${ACCENT_COLOR}] transition duration-300 mt-4 sm:mt-0`}
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                // ProductCard needs to be wrapped in motion.div for animation
                <motion.div key={product.id} variants={fadeIn}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600 py-10">
                No featured products yet. Check back soon!
              </p>
            )}
          </motion.div>
        </div>
      </section>

      ---

      {/* 🔥 Trending - Clean white background for visual separation and clarity */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className={`h-7 w-7 text-[${ACCENT_COLOR}]`} />
                <h2
                  className={`text-3xl md:text-4xl font-extrabold text-[${PRIMARY_COLOR}]`}
                >
                  Trending Now
                </h2>
              </div>
              <p className="text-lg text-gray-600">
                The most popular items this week, selling fast.
              </p>
            </div>
            {/* Improved CTA link style */}
            <Link
              href="/products"
              className={`flex items-center text-[${PRIMARY_COLOR}] font-semibold hover:text-[${ACCENT_COLOR}] transition duration-300 mt-4 sm:mt-0`}
            >
              Discover All Trending
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {trendingProducts.length > 0 ? (
              trendingProducts.map((product) => (
                // ProductCard needs to be wrapped in motion.div for animation
                <motion.div key={product.id} variants={fadeIn}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600 py-10">
                No trending products yet.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      ---

      {/* 📧 Newsletter - High-contrast section for conversion focus */}
      <section
        className={`py-20 bg-gradient-to-br from-[#19384B] via-[#2C5670] to-[#48657B]`}
      >
        <div className="container mx-auto px-6 text-center">
          {/* Box shadow and border for premium feel */}
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-100">
            <Mail className={`h-10 w-10 mx-auto mb-4 text-[${ACCENT_COLOR}]`} />
            <h2
              className={`text-3xl md:text-4xl font-extrabold mb-4 text-[${PRIMARY_COLOR}]`}
            >
              Get Exclusive Deals
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
              Join our mailing list for weekly product drops, members-only
              discounts, and insider news.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your best email address"
                aria-label="Email address for newsletter subscription"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-4 focus:ring-[${ACCENT_COLOR}]/20 transition duration-300 placeholder-gray-400 text-gray-700`}
                required
              />
              <Button
                onClick={handleSubscribe}
                className={`px-8 py-3 bg-[${PRIMARY_COLOR}] hover:bg-[${ACCENT_COLOR}] text-white rounded-full font-semibold shadow-xl transition-all duration-300 transform hover:scale-[1.03]`}
              >
                Subscribe Now
              </Button>
            </div>
            {newsletterMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 text-sm font-medium ${
                  newsletterMessage.startsWith('✅')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {newsletterMessage}
              </motion.p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import useSWR from 'swr';
// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
// import { Button } from '@/components/button';
// import dynamic from 'next/dynamic';
// import { Skeleton } from '@/components/skeleton';
// import { toast } from 'react-hot-toast';

// // Lazy load product card for better performance
// const ProductCard = dynamic(() => import('@/components/product-card'), { ssr: false });

// const fetcher = (url) =>
//   fetch(url)
//     .then(async (r) => {
//       if (!r.ok) {
//         const err = await r.text();
//         throw new Error(err || 'Fetch error');
//       }
//       return r.json();
//     })
//     .catch((err) => {
//       console.error('❌ Fetch failed:', err);
//       return null;
//     });

// export default function UserDashboard() {
//   const [email, setEmail] = useState('');
//   const [newsletterMessage, setNewsletterMessage] = useState('');

//   // ✅ Data Fetching (SWR)
//   const {
//     data: productsData,
//     isLoading: productsLoading,
//     error: productsError,
//   } = useSWR('/api/products?page=1&limit=12', fetcher);

//   const {
//     data: categoriesData,
//     isLoading: categoriesLoading,
//     error: categoriesError,
//   } = useSWR('/api/categories', fetcher);

//   // ✅ Defensive Data Handling
//   const products = Array.isArray(productsData?.products)
//     ? productsData.products
//     : [];
//   const categories = Array.isArray(categoriesData?.categories)
//     ? categoriesData.categories
//     : [];

//   const featuredProducts = products.filter((p) => p.featured);
//   const trendingProducts = [...products]
//     .sort((a, b) => (b.sales || 0) - (a.sales || 0))
//     .slice(0, 8);

//   // ✅ Newsletter Submit
//   const handleSubscribe = async () => {
//     if (!email) return setNewsletterMessage('⚠️ Please enter your email.');
//     try {
//       const res = await fetch('/api/newsletter', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         toast.success('Subscribed successfully 🎉');
//         setEmail('');
//         setNewsletterMessage('✅ Subscribed successfully!');
//       } else {
//         setNewsletterMessage(data.error || 'Subscription failed.');
//       }
//     } catch (err) {
//       console.error('❌ Newsletter error:', err);
//       setNewsletterMessage('Server error. Try again later.');
//     }
//   };

//   // ✅ Unified Loading State
//   if (productsLoading || categoriesLoading) {
//     return (
//       <div className="min-h-screen flex flex-col gap-10 items-center justify-center bg-gradient-to-br from-[#D7C6BC] via-[#48657B] to-[#19384B]">
//         <Skeleton className="w-64 h-10 rounded-full" />
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//           {[...Array(8)].map((_, i) => (
//             <Skeleton key={i} className="h-64 w-56 rounded-3xl" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // ✅ Handle API Errors
//   if (categoriesError || productsError) {
//     console.error('❌ Error loading dashboard data:', {
//       categoriesError,
//       productsError,
//     });
//     toast.error('Failed to load content.');
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-700">
//         <p className="text-xl font-medium mb-3">⚠️ Unable to load content</p>
//         <Button onClick={() => location.reload()} className="px-6">
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   // ✅ Handle Empty Categories or Products
//   if (categories.length === 0 && products.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen text-center text-gray-600">
//         <Sparkles className="h-10 w-10 text-gray-400 mb-2" />
//         <p className="text-lg font-semibold">No products or categories found</p>
//         <p className="text-sm text-gray-500">Please check back later!</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#D7C6BC] via-[#48657B] to-[#19384B] text-gray-900">
//       {/* 🌟 Hero Section */}
//       <motion.section
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="relative overflow-hidden text-white"
//       >
//         <div className="absolute inset-0 bg-gradient-to-br from-[#19384B] via-[#2C5670] to-[#48657B] opacity-90" />
//         <div className="container mx-auto px-4 py-24 md:py-36 text-center relative z-10">
//           <div className="max-w-3xl mx-auto">
//             <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg shadow-lg text-white rounded-full px-6 py-3 mb-6">
//               <Sparkles className="h-5 w-5 animate-pulse text-[#D7C6BC]" />
//               <span className="text-sm font-semibold tracking-wide uppercase">
//                 New Season Sale - Up to 50% Off
//               </span>
//             </div>

//             <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
//               Shop Smart with{' '}
//               <span className="text-[#D7C6BC]">RocketDrop</span>
//             </h1>

//             <p className="text-lg md:text-xl mb-10 text-[#F5DEB3]/90 max-w-2xl mx-auto">
//               Discover handpicked products from trusted global suppliers —
//               shipped directly to your door.
//             </p>

//             <div className="flex flex-col sm:flex-row justify-center gap-6">
//               <Button className="bg-gradient-to-r from-[#2C5670] to-[#48657B] hover:from-[#48657B] hover:to-[#2C5670] text-white px-10 py-4 text-lg rounded-full shadow-2xl">
//                 <Link href="/products" className="flex items-center gap-2">
//                   Shop Now <ArrowRight className="h-5 w-5" />
//                 </Link>
//               </Button>
//               <Button className="bg-[#D7C6BC] hover:bg-[#C6B7AD] text-[#19384B] px-10 py-4 text-lg rounded-full shadow-2xl">
//                 <Link href="/deals">View Deals</Link>
//               </Button>
//             </div>
//           </div>
//         </div>
//       </motion.section>

//       {/* 🛍 Categories */}
//       <section className="py-20 bg-[#D7C6BC]/40 backdrop-blur-md">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-[#19384B] to-[#2C5670] bg-clip-text text-transparent">
//             Shop by Categories
//           </h2>

//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//             className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
//           >
//             {Array.isArray(categories) && categories.length > 0 ? (
//               categories.map((category) => (
//                 <Link
//                   key={category.id}
//                   href={`/category/${category.slug}`}
//                   className="group"
//                 >
//                   <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#19384B] to-[#2C5670] shadow-lg transition-all duration-500 hover:scale-105">
//                     <Image
//                       src={category.imageUrl || '/images/categories/placeholder.svg'}
//                       alt={category.name}
//                       fill
//                       loading="lazy"
//                       placeholder="blur"
//                       blurDataURL="/images/blur-placeholder.png"
//                       className="object-cover"
//                     />
//                     <div className="absolute inset-0 bg-black/30" />
//                     <div className="absolute bottom-3 left-3 right-3 text-white text-center">
//                       <h3 className="font-semibold text-sm">{category.name}</h3>
//                     </div>
//                   </div>
//                 </Link>
//               ))
//             ) : (
//               <p className="col-span-full text-center text-gray-700">
//                 No categories found.
//               </p>
//             )}
//           </motion.div>
//         </div>
//       </section>

//       {/* 🌟 Featured Products */}
//       <section className="py-20 bg-gradient-to-br from-[#D7C6BC] via-[#48657B] to-[#2C5670]">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-[#19384B] to-[#2C5670] bg-clip-text text-transparent">
//                 <Sparkles className="h-8 w-8 text-[#2C5670]" />
//                 Featured Products
//               </h2>
//               <p className="text-gray-200">
//                 Hand-picked favorites just for you
//               </p>
//             </div>
//             <Link
//               href="/products"
//               className="flex items-center text-[#D7C6BC] font-semibold hover:underline"
//             >
//               View All <ArrowRight className="ml-2 h-4 w-4" />
//             </Link>
//           </div>

//           <motion.div
//             layout
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
//           >
//             {featuredProducts.length > 0 ? (
//               featuredProducts.map((product) => (
//                 <ProductCard key={product.id} product={product} />
//               ))
//             ) : (
//               <p className="col-span-full text-center text-gray-200">
//                 No featured products yet.
//               </p>
//             )}
//           </motion.div>
//         </div>
//       </section>

//       {/* 🔥 Trending */}
//       <section className="py-20 bg-[#D7C6BC]/40 backdrop-blur-md">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-[#19384B] to-[#48657B] bg-clip-text text-transparent">
//                 <TrendingUp className="h-8 w-8 text-[#2C5670]" />
//                 Trending Now
//               </h2>
//               <p className="text-gray-700">Most popular items this week</p>
//             </div>
//             <Link
//               href="/products"
//               className="flex items-center text-[#19384B] font-semibold hover:underline"
//             >
//               View All <ArrowRight className="ml-2 h-4 w-4" />
//             </Link>
//           </div>
//           <motion.div
//             layout
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
//           >
//             {trendingProducts.length > 0 ? (
//               trendingProducts.map((product) => (
//                 <ProductCard key={product.id} product={product} />
//               ))
//             ) : (
//               <p className="col-span-full text-center text-gray-700">
//                 No trending products yet.
//               </p>
//             )}
//           </motion.div>
//         </div>
//       </section>

//       {/* 📧 Newsletter */}
//       <section className="py-20 bg-gradient-to-br from-[#D7C6BC] via-[#48657B] to-[#19384B]">
//         <div className="container mx-auto px-4 text-center">
//           <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-xl">
//             <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#19384B] to-[#2C5670] bg-clip-text text-transparent">
//               Stay Updated
//             </h2>
//             <p className="text-gray-700 mb-8">
//               Subscribe to our newsletter for exclusive deals and updates
//             </p>
//             <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
//               <input
//                 type="email"
//                 placeholder="Your email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2C5670]"
//               />
//               <Button
//                 onClick={handleSubscribe}
//                 className="px-6 py-3 bg-gradient-to-r from-[#2C5670] to-[#48657B] hover:from-[#48657B] hover:to-[#2C5670] text-white rounded-full shadow-xl transition-all duration-300 transform hover:scale-105"
//               >
//                 Subscribe
//               </Button>
//             </div>
//             {newsletterMessage && (
//               <p className="mt-3 text-sm text-gray-800">{newsletterMessage}</p>
//             )}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }
