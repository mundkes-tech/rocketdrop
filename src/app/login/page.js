'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const { login, isLoggedIn } = useAuth();

  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🧩 Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.clear();
    console.log('🟦 Login attempt started...');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('📡 Sending login request to /api/login...');

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      console.log('🧠 API Response:', data);

      if (!res.ok || !data.success) {
        setError(data.message || data.error || 'Invalid credentials');
        return;
      }

      // ✅ Extract and validate user data
      const userData = data.data?.user;
      if (!userData) {
        setError('Unexpected server response. Please try again.');
        return;
      }

      // ✅ Save user locally + in AuthContext
      login(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('💾 User saved to localStorage:', userData);

      // ✅ Check if user had a saved redirect (e.g., from "Buy Now" or Profile)
      const storedRedirect = localStorage.getItem('redirectAfterLogin');
      if (storedRedirect) {
        console.log(`🚀 Redirecting to saved route: ${storedRedirect}`);
        localStorage.removeItem('redirectAfterLogin');
        setTimeout(() => {
          router.replace(storedRedirect);
        }, 1000);
      } else if (userData.role === 'supplier') {
        console.log('🚀 Redirecting to supplier dashboard');
        setTimeout(() => {
          router.replace('/supplier-dashboard');
        }, 1000);
      } else {
        console.log('🚀 Redirecting to user dashboard');
        setTimeout(() => {
          router.replace('/user-dashboard');
        }, 1000);
      }
    } catch (err) {
      console.error('💥 Unexpected error during login:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Success screen animation
  if (isLoggedIn) {
    return (
      <div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0A1128] via-[#001F54] to-[#034078] overflow-hidden">
        <Confetti width={width} height={height} numberOfPieces={180} recycle={false} />
        <CheckCircle className="text-green-400 w-20 h-20 mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-blue-200 mb-2 animate-fadeIn">
          Login Successful!
        </h2>
        <div className="w-40 h-1 bg-blue-400 rounded-full overflow-hidden mt-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="h-full bg-green-400"
          />
        </div>
        <p className="text-blue-100 text-lg mt-3">Redirecting...</p>
      </div>
    );
  }

  // 🧩 Main Login Form
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Panel (Form) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full md:w-1/2 h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1128] via-[#001F54] to-[#034078] p-8 sm:p-12 shadow-2xl"
      >
        {/* 🧭 Back to Dashboard Button */}
        <button
          type="button"
          onClick={() => router.push('/user-dashboard')}
          className="absolute top-6 left-6 flex items-center gap-2 text-blue-200 hover:text-blue-400 transition cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="w-full max-w-md text-white">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
            Login to RocketDrop
          </h2>

          {/* Role Selector */}
          <div className="flex justify-center mb-6 space-x-4">
            {['user', 'supplier'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-6 py-3 rounded-full font-medium border cursor-pointer transition ${role === r
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                    : 'bg-white/10 text-blue-200 border-blue-300 hover:bg-white/20'
                  }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-center mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="grid grid-cols-1 gap-6">
            <FloatingInput
              name="email"
              type="email"
              label="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            <FloatingInput
              name="password"
              type="password"
              label="Password*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`mt-4 py-3 rounded-full font-semibold transition shadow-md cursor-pointer ${loading
                  ? 'bg-blue-400 opacity-70 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:scale-[1.02]'
                }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-6 text-blue-200 text-sm">
            New user?{' '}
            <Link
              href="/register"
              className="text-blue-300 font-medium hover:underline cursor-pointer"
            >
              Sign up
            </Link>
          </p>

          <p className="text-center mt-2 text-sm">
            <Link
              href="/forgot-password"
              className="text-blue-300 hover:underline cursor-pointer"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Right Panel (Illustration) */}
      <div className="hidden md:flex w-1/2 h-screen relative bg-gradient-to-br from-[#004a7c] to-[#e8f1f5] overflow-hidden p-12">
        <Image
          src="/Images/login.jpg"
          alt="Login Illustration"
          fill
          className="object-cover opacity-30 absolute top-0 left-0 z-0"
          priority
        />
        <div className="flex flex-col items-center justify-center text-center z-10 w-full">
          <h1 className="text-6xl font-bold mb-4 text-[#011f4b]">Welcome Back!</h1>
          <p className="text-lg text-[#011f4b]">
            Login to your RocketDrop account and continue shopping or selling globally.
          </p>
        </div>
      </div>
    </div>
  );
}

// 💡 Floating Label Input Component
function FloatingInput({ name, type = 'text', label, value, onChange, required, autoFocus }) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoFocus={autoFocus}
        placeholder=" "
        className="peer w-full border border-white/20 bg-white/10 rounded-lg px-4 pt-5 pb-3 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
      />
      <label className="absolute left-4 top-3 text-blue-200 text-sm transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-300">
        {label}
      </label>
    </div>
  );
}


