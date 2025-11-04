'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { CheckCircle } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function LoginPage() {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const { user, login, isLoggedIn } = useAuth();

  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 🧩 Check localStorage on mount — redirect if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const loggedUser = storedUser ? JSON.parse(storedUser) : null;

    if (loggedUser) {
      if (loggedUser.role === 'user') router.replace('/user-dashboard');
      else if (loggedUser.role === 'supplier') router.replace('/supplier-dashboard');
    }
  }, [router]);

  // 🧩 Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again later.');
    }
  };

  // 🧩 Redirect after login
  useEffect(() => {
    if (isLoggedIn && user) {
      const timer = setTimeout(() => {
        if (user.role === 'user') router.push('/user-dashboard');
        else if (user.role === 'supplier') router.push('/supplier-dashboard');
        else router.push('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, user, router]);

  // ✅ Logged-in success screen
  if (isLoggedIn) {
    return (
      <div className="relative flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#e8f1f5] to-white overflow-hidden">
        <Confetti width={width} height={height} numberOfPieces={150} recycle={false} />

        <CheckCircle className="text-green-500 w-20 h-20 mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-[#2C5670] mb-2 animate-fadeIn">
          Login Successful!
        </h2>
        <p className="text-gray-600 text-lg">Redirecting to your dashboard...</p>
      </div>
    );
  }

  // 🧩 Main Login Form
  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f1f5] to-[#e8f1f5] p-8 sm:p-12 rounded-l-3xl shadow-2xl">
        <div className="w-full max-w-md">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C5670] text-center mb-8">
            Login to RocketDrop
          </h2>

          {/* Role Selector */}
          <div className="flex justify-center mb-6 space-x-4">
            {['user', 'supplier'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-6 py-3 rounded-full font-medium border transition ${
                  role === r
                    ? 'bg-gradient-to-r from-[#D7C6BC] to-[#2C5670] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="grid grid-cols-1 gap-6">
            <FloatingInput
              name="email"
              type="email"
              label="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="mt-4 bg-gradient-to-r from-[#004a7c] to-[#005691] text-white py-3 rounded-full font-semibold hover:opacity-90 transition shadow-md"
            >
              Login
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm">
            New user?{' '}
            <Link href="/register" className="text-[#2C5670] font-medium hover:underline">
              Sign up
            </Link>
          </p>

          <p className="text-center mt-2 text-sm">
            <Link href="/forgot-password" className="text-gray-500 hover:underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel */}
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
            Login to your RocketDrop account and continue selling globally with ease.
          </p>
        </div>
      </div>
    </div>
  );
}

function FloatingInput({ name, type = 'text', label, value, onChange, required }) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-3 text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#004a7c]/60 transition-all duration-200"
      />
      <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all duration-200 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#2C5670]">
        {label}
      </label>
    </div>
  );
}




// const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError('');

  //   try {
  //     const res = await fetch('/api/login', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email, password, role }),
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       login({ email, role }); // update global state
  //       router.push(data.redirect || '/home');
  //     } else {
  //       setError(data.error || 'Invalid credentials');
  //     }
  //   } catch {
  //     setError('Something went wrong. Try again later.');
  //   }
  // };