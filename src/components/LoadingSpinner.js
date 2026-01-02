'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#19384B] via-[#48657B] to-[#D7C6BC] text-white">
      {/* Animated logo ring */}
      <motion.div
        className="relative w-20 h-20 mb-8"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      >
        <div className="absolute inset-0 border-[6px] border-t-transparent border-[#D7C6BC] rounded-full shadow-[0_0_25px_#D7C6BC]"></div>
      </motion.div>

      {/* RocketDrop Text */}
      <motion.h1
        className="text-3xl font-extrabold tracking-wide text-white"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Rocket<span className="text-[#D7C6BC]">Drop</span>
      </motion.h1>

      {/* Subtext */}
      <motion.p
        className="mt-4 text-lg font-medium text-[#F5DEB3]/90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.4,
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        Loading your experience...
      </motion.p>
    </div>
  );
}
