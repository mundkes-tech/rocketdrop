'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoggedIn } = useAuth();
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
        // ✅ Save full user info (with id)
        login(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));

        // ✅ Redirect to correct dashboard
        router.push(data.redirect);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again later.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f1f5] to-[#e8f1f5] p-8 sm:p-12 rounded-l-3xl shadow-2xl">
        <div className="w-full max-w-md">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C5670] text-center mb-8">
            {isLoggedIn ? 'Welcome Back!' : 'Login to RocketDrop'}
          </h2>

          {!isLoggedIn ? (
            <>
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
            </>
          ) : (
            <div className="flex flex-col items-center mt-10 space-y-6">
              <Link href="/profile" className="text-[#2C5670] hover:text-[#004a7c]">
                <User size={64} />
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.reload();
                }}
                className="px-5 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
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
          <h1 className="text-6xl font-bold mb-4 text-[#011f4b]">
            {isLoggedIn ? 'You are logged in!' : 'Welcome Back!'}
          </h1>
          <p className="text-lg text-[#011f4b]">
            {isLoggedIn
              ? `Continue managing your ${role} account.`
              : 'Login to your RocketDrop account and continue selling globally with ease.'}
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