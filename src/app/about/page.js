



'use client';

import { motion } from 'framer-motion';
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
  Headphones 
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <motion.h1 
          className="text-5xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          About <span className="text-blue-600">RocketDrop</span>
        </motion.h1>

        <motion.p 
          className="text-lg text-gray-600 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          RocketDrop is a next-generation dropshipping platform built to connect users directly with global suppliers. 
          We make online shopping faster, simpler, and smarter — cutting out middlemen and giving you access to unbeatable prices.
        </motion.p>

        <motion.div 
          className="flex justify-center mt-10"
          whileHover={{ scale: 1.1 }}
        >
          <div className="bg-blue-600 p-5 rounded-full shadow-lg">
            <Rocket className="h-14 w-14 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Core Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {[
          {
            icon: Package,
            title: "Curated Selection",
            text: "Every product we list passes through strict quality checks to ensure you get only the best.",
          },
          {
            icon: Globe,
            title: "Global Reach",
            text: "Our supplier network spans 30+ countries — offering unique, trendy, and diverse products.",
          },
          {
            icon: TrendingUp,
            title: "Always Trending",
            text: "We constantly refresh our catalog to feature new and innovative items people love.",
          },
          {
            icon: ShieldCheck,
            title: "Buyer Protection",
            text: "Your orders are covered by RocketDrop’s secure payment and satisfaction guarantee.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center mb-4">
              <item.icon className="h-7 w-7 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">{item.title}</h3>
            </div>
            <p className="text-gray-700">{item.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Why Choose Us Section */}
      <div className="text-center mb-20">
        <motion.h2 
          className="text-4xl font-bold mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Why Choose <span className="text-blue-600">RocketDrop?</span>
        </motion.h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-12">
          We combine technology, transparency, and trust to deliver the ultimate shopping experience.
          Here’s what makes us stand out from the rest.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Zap, title: "Lightning-Fast Orders", text: "Optimized supply chain ensures quick delivery and hassle-free tracking." },
            { icon: Wallet, title: "Unbeatable Prices", text: "No middlemen — just pure value directly from global suppliers." },
            { icon: Headphones, title: "24/7 Support", text: "Our support team is always available to assist you with any concern." },
            { icon: Clock, title: "Real-Time Updates", text: "Track your shipments and order status with live updates anytime." },
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="bg-blue-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
              whileHover={{ scale: 1.03 }}
            >
              <item.icon className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Platform Benefits Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-white rounded-2xl p-10 mb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-3xl font-semibold text-center mb-8">Platform Benefits</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "No Inventory Needed", text: "Suppliers handle everything — from packaging to delivery. You just order." },
            { title: "Automated Processing", text: "Seamless order flow integrated directly with our supplier network." },
            { title: "Data Insights", text: "Access analytics on trending products, deals, and offers — updated daily." },
            { title: "Secure Payments", text: "All payments are encrypted and processed through verified gateways." },
            { title: "Eco-Friendly Shipping", text: "Partnered logistics that minimize carbon footprint and promote green delivery." },
            { title: "Custom Recommendations", text: "Smart AI suggests products based on your preferences and history." },
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all"
              whileHover={{ y: -4 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-blue-700">{item.title}</h3>
              <p className="text-gray-700">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mission, Vision, Values */}
      <div className="grid md:grid-cols-3 gap-8 mb-20 text-center">
        {[
          {
            icon: Users,
            title: "Our Community",
            text: "Join 10,000+ happy customers and 500+ verified suppliers who trust RocketDrop.",
          },
          {
            icon: HeartHandshake,
            title: "Our Values",
            text: "Integrity, innovation, and customer satisfaction are the core of our mission.",
          },
          {
            icon: Star,
            title: "Our Vision",
            text: "To become the world’s most trusted and customer-centric dropshipping platform.",
          },
        ].map((item, i) => (
          <motion.div 
            key={i}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
            whileHover={{ scale: 1.03 }}
          >
            <item.icon className="h-10 w-10 text-blue-600 mb-3 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.text}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-semibold mb-6">
          Ready to <span className="text-blue-600">Shop Smart?</span>
        </h2>
        <p className="text-gray-600 mb-8">
          Discover trending, high-quality products from around the globe — delivered right to your doorstep.
        </p>
        <a href="/products" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors">
          Explore Products
        </a>
      </motion.div>
    </div>
  );
}
