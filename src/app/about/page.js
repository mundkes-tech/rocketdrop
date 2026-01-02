'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Rocket, 
  Package, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  HeartHandshake, 
  Star, 
  Zap, 
  Clock, 
  Wallet, 
  Headphones,
  ArrowRight // Added for a modern CTA look
} from 'lucide-react';

// --- Design System Constants (For consistency) ---
const PRIMARY_COLOR = 'text-indigo-800'; // Deep, sophisticated blue/indigo for main text
const ACCENT_COLOR = 'bg-indigo-600';     // Vibrant indigo for CTAs and highlights
const ACCENT_HOVER = 'hover:bg-indigo-700';
const LIGHT_BG = 'bg-gray-50';          // Light, clean background
const SECTION_HEADING = 'font-extrabold text-4xl lg:text-5xl';
const CARD_SHADOW = 'shadow-xl hover:shadow-2xl transition-all duration-300';
const BORDER_STYLE = 'border border-gray-100';


// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};


export default function AboutPage() {
  return (
    <div className={`min-h-screen ${LIGHT_BG} font-sans`}>
      <div className="container mx-auto px-6 py-24 md:py-32">
        
        {/* 🚀 Hero Section - Stronger Visual Hierarchy */}
        <motion.header 
          className="max-w-4xl mx-auto text-center mb-20"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <h1 
            className={`text-5xl md:text-6xl ${PRIMARY_COLOR} font-black mb-6 leading-tight`}
          >
            Our Mission: Powering <span className="text-indigo-600">Smart Global Shopping</span>
          </h1>

          <p 
            className="text-xl text-gray-600 max-w-3xl mx-auto font-light"
          >
            RocketDrop is a **next-generation dropshipping platform** built to connect you directly with global suppliers. We deliver speed, value, and unmatched quality, cutting out the complexity of traditional commerce.
          </p>

          <motion.div 
            className="flex justify-center mt-12"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className={`p-6 rounded-full shadow-2xl ${ACCENT_COLOR} transition-all duration-500`}>
              <Rocket className="h-16 w-16 text-white" />
            </div>
          </motion.div>
        </motion.header>

        {/* 🌟 Core Features - Elevated Card Design */}
        <section className="mb-24">
          <motion.h2
            className={`${SECTION_HEADING} ${PRIMARY_COLOR} text-center mb-16`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Our Commitment to You
          </motion.h2>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {[
              {
                icon: Package,
                title: "Curated Selection",
                text: "Every product we list passes through strict quality checks to ensure you receive only the best items.",
              },
              {
                icon: Globe,
                title: "Global Reach",
                text: "Our supplier network spans 30+ countries, offering unique, trendy, and truly diverse products.",
              },
              {
                icon: TrendingUp,
                title: "Always Trending",
                text: "We constantly refresh our catalog using data-driven insights to feature new and innovative items.",
              },
              {
                icon: ShieldCheck,
                title: "Buyer Protection",
                text: "Your orders are fully covered by RocketDrop’s secure payment and satisfaction guarantee.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`bg-white p-8 rounded-2xl ${CARD_SHADOW} ${BORDER_STYLE} cursor-pointer`}
              >
                <div className={`p-3 rounded-xl inline-block mb-4 ${ACCENT_COLOR}/10`}>
                  <item.icon className="h-6 w-6 text-indigo-600" />
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${PRIMARY_COLOR}`}>{item.title}</h3>
                <p className="text-gray-600 font-medium">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <hr className="border-gray-200 mb-24" />

        {/* ❓ Why Choose Us Section - Clearer Visual Structure */}
        <section className="text-center mb-24">
          <motion.h2 
            className={`${SECTION_HEADING} ${PRIMARY_COLOR} mb-6`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Why Choose <span className="text-indigo-600">RocketDrop?</span>
          </motion.h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
            We combine cutting-edge technology, transparency, and trust to deliver an exceptional shopping experience.
          </p>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {[
              { icon: Zap, title: "Speed", text: "Optimized logistics ensures quick delivery and hassle-free tracking." },
              { icon: Wallet, title: "Value", text: "No middlemen — just pure value directly from global suppliers." },
              { icon: Headphones, title: "Support", text: "Our support team is always available 24/7 to assist you." },
              { icon: Clock, title: "Live Updates", text: "Track your shipments and order status with real-time updates." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className={`bg-white rounded-xl p-6 md:p-8 ${CARD_SHADOW} ${BORDER_STYLE} transform hover:scale-[1.03] transition-all`}
              >
                <item.icon className={`h-10 w-10 text-indigo-600 mx-auto mb-4 p-1 rounded-full ${ACCENT_COLOR}/10`} />
                <h3 className={`text-lg font-bold mb-2 ${PRIMARY_COLOR}`}>{item.title}</h3>
                <p className="text-sm text-gray-600">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <hr className="border-gray-200 mb-24" />

        {/* ⚙️ Platform Benefits Section - Clean, distinct background */}
        <motion.section 
          className={`rounded-3xl p-10 md:p-16 mb-24 ${ACCENT_COLOR} text-white`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl font-extrabold text-center mb-12">
            The RocketDrop Advantage
          </h2>
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {[
              { title: "Zero Inventory", text: "Suppliers handle everything — from packaging to delivery. You just shop." },
              { title: "Automated Flow", text: "Seamless order processing integrated directly with our supplier network." },
              { title: "Data Insights", text: "Access analytics on trending products, deals, and daily offer updates." },
              { title: "Secure Payments", text: "All payments are encrypted and processed through verified global gateways." },
              { title: "Eco-Friendly", text: "Partnered logistics that minimize carbon footprint and promote green delivery." },
              { title: "AI Recommendations", text: "Smart AI suggests personalized products based on your preferences." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-200">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* 🎯 Mission, Vision, Values - Clear purpose alignment */}
        <section className="grid md:grid-cols-3 gap-8 mb-24 text-center">
          {[
            {
              icon: Users,
              title: "Community",
              text: "Join 10,000+ happy customers and 500+ verified suppliers who trust RocketDrop.",
              color: 'text-green-600'
            },
            {
              icon: HeartHandshake,
              title: "Values",
              text: "Integrity, innovation, and customer satisfaction are the core of our daily mission.",
              color: 'text-yellow-600'
            },
            {
              icon: Star,
              title: "Vision",
              text: "To become the world’s most trusted and customer-centric dropshipping platform.",
              color: 'text-red-600'
            },
          ].map((item, i) => (
            <motion.div 
              key={i}
              className={`bg-white rounded-2xl ${CARD_SHADOW} p-8 ${BORDER_STYLE} hover:bg-gray-50 transition-all`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: i * 0.1 }}
            >
              <item.icon className={`h-12 w-12 ${item.color} mb-4 mx-auto`} />
              <h3 className={`text-2xl font-bold mb-2 ${PRIMARY_COLOR}`}>{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </section>

        {/* 🛍️ Final CTA - High Conversion Button */}
        <motion.div 
          className="text-center rounded-2xl p-10 md:p-12 border-4 border-dashed border-indigo-200 bg-white shadow-inner"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`text-4xl font-black mb-4 ${PRIMARY_COLOR}`}>
            Ready to <span className="text-indigo-600">Shop Smarter?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Discover trending, high-quality products from around the globe — delivered right to your doorstep.
          </p>
          <Link 
            href="/products" 
            className={`inline-flex items-center gap-3 ${ACCENT_COLOR} text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg ${ACCENT_HOVER} transition-all duration-300 transform hover:scale-[1.05]`}
            aria-label="Explore Products and Start Shopping"
          >
            Explore Products
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}



// 'use client';

// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import { 
//   Rocket, 
//   Package, 
//   Globe, 
//   TrendingUp, 
//   ShieldCheck, 
//   Users, 
//   HeartHandshake, 
//   Star, 
//   Zap, 
//   Clock, 
//   Wallet, 
//   Headphones 
// } from 'lucide-react';

// export default function AboutPage() {
//   return (
//     <div className="container mx-auto px-4 py-16">
//       {/* Hero Section */}
//       <div className="max-w-5xl mx-auto text-center mb-16">
//         <motion.h1 
//           className="text-5xl font-bold mb-6"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           About <span className="text-blue-600">RocketDrop</span>
//         </motion.h1>

//         <motion.p 
//           className="text-lg text-gray-600 max-w-3xl mx-auto"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           RocketDrop is a next-generation dropshipping platform built to connect users directly with global suppliers. 
//           We make online shopping faster, simpler, and smarter — cutting out middlemen and giving you access to unbeatable prices.
//         </motion.p>

//         <motion.div 
//           className="flex justify-center mt-10"
//           whileHover={{ scale: 1.1 }}
//         >
//           <div className="bg-blue-600 p-5 rounded-full shadow-lg">
//             <Rocket className="h-14 w-14 text-white" />
//           </div>
//         </motion.div>
//       </div>

//       {/* Core Features */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
//         {[
//           {
//             icon: Package,
//             title: "Curated Selection",
//             text: "Every product we list passes through strict quality checks to ensure you get only the best.",
//           },
//           {
//             icon: Globe,
//             title: "Global Reach",
//             text: "Our supplier network spans 30+ countries — offering unique, trendy, and diverse products.",
//           },
//           {
//             icon: TrendingUp,
//             title: "Always Trending",
//             text: "We constantly refresh our catalog to feature new and innovative items people love.",
//           },
//           {
//             icon: ShieldCheck,
//             title: "Buyer Protection",
//             text: "Your orders are covered by RocketDrop’s secure payment and satisfaction guarantee.",
//           },
//         ].map((item, i) => (
//           <motion.div
//             key={i}
//             className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
//             whileHover={{ y: -5 }}
//           >
//             <div className="flex items-center mb-4">
//               <item.icon className="h-7 w-7 text-blue-600 mr-3" />
//               <h3 className="text-xl font-semibold">{item.title}</h3>
//             </div>
//             <p className="text-gray-700">{item.text}</p>
//           </motion.div>
//         ))}
//       </div>

//       {/* Why Choose Us Section */}
//       <div className="text-center mb-20">
//         <motion.h2 
//           className="text-4xl font-bold mb-6"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//         >
//           Why Choose <span className="text-blue-600">RocketDrop?</span>
//         </motion.h2>
//         <p className="text-gray-600 max-w-3xl mx-auto mb-12">
//           We combine technology, transparency, and trust to deliver the ultimate shopping experience.
//           Here’s what makes us stand out from the rest.
//         </p>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {[
//             { icon: Zap, title: "Lightning-Fast Orders", text: "Optimized supply chain ensures quick delivery and hassle-free tracking." },
//             { icon: Wallet, title: "Unbeatable Prices", text: "No middlemen — just pure value directly from global suppliers." },
//             { icon: Headphones, title: "24/7 Support", text: "Our support team is always available to assist you with any concern." },
//             { icon: Clock, title: "Real-Time Updates", text: "Track your shipments and order status with live updates anytime." },
//           ].map((item, i) => (
//             <motion.div 
//               key={i}
//               className="bg-blue-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
//               whileHover={{ scale: 1.03 }}
//             >
//               <item.icon className="h-10 w-10 text-blue-600 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
//               <p className="text-gray-600">{item.text}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Platform Benefits Section */}
//       <motion.div 
//         className="bg-gradient-to-r from-blue-50 to-white rounded-2xl p-10 mb-20"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         <h2 className="text-3xl font-semibold text-center mb-8">Platform Benefits</h2>
//         <div className="grid md:grid-cols-3 gap-8">
//           {[
//             { title: "No Inventory Needed", text: "Suppliers handle everything — from packaging to delivery. You just order." },
//             { title: "Automated Processing", text: "Seamless order flow integrated directly with our supplier network." },
//             { title: "Data Insights", text: "Access analytics on trending products, deals, and offers — updated daily." },
//             { title: "Secure Payments", text: "All payments are encrypted and processed through verified gateways." },
//             { title: "Eco-Friendly Shipping", text: "Partnered logistics that minimize carbon footprint and promote green delivery." },
//             { title: "Custom Recommendations", text: "Smart AI suggests products based on your preferences and history." },
//           ].map((item, i) => (
//             <motion.div 
//               key={i}
//               className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all"
//               whileHover={{ y: -4 }}
//             >
//               <h3 className="text-xl font-semibold mb-2 text-blue-700">{item.title}</h3>
//               <p className="text-gray-700">{item.text}</p>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>

//       {/* Mission, Vision, Values */}
//       <div className="grid md:grid-cols-3 gap-8 mb-20 text-center">
//         {[
//           {
//             icon: Users,
//             title: "Our Community",
//             text: "Join 10,000+ happy customers and 500+ verified suppliers who trust RocketDrop.",
//           },
//           {
//             icon: HeartHandshake,
//             title: "Our Values",
//             text: "Integrity, innovation, and customer satisfaction are the core of our mission.",
//           },
//           {
//             icon: Star,
//             title: "Our Vision",
//             text: "To become the world’s most trusted and customer-centric dropshipping platform.",
//           },
//         ].map((item, i) => (
//           <motion.div 
//             key={i}
//             className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
//             whileHover={{ scale: 1.03 }}
//           >
//             <item.icon className="h-10 w-10 text-blue-600 mb-3 mx-auto" />
//             <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
//             <p className="text-gray-600">{item.text}</p>
//           </motion.div>
//         ))}
//       </div>

//       {/* CTA */}
//       <motion.div 
//         className="text-center"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.3 }}
//       >
//         <h2 className="text-3xl font-semibold mb-6">
//           Ready to <span className="text-blue-600">Shop Smart?</span>
//         </h2>
//         <p className="text-gray-600 mb-8">
//           Discover trending, high-quality products from around the globe — delivered right to your doorstep.
//         </p>
//         <Link href="/products" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors">
//           Explore Products
//         </Link>
//       </motion.div>
//     </div>
//   );
// }
