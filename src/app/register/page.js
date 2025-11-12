'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Frontend validation before API call
  const validateForm = () => {
    if (!form.email || !form.password) return 'Email and Password are required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email format';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.phone && !/^\d{10}$/.test(form.phone)) return 'Phone number must be 10 digits';
    return '';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...form }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Registration successful!');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Server error, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Gradient Panel */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 h-screen relative
          bg-gradient-to-br from-[#004a7c] to-[#e8f1f5] p-12 overflow-hidden">
        <Image
          src="/Images/form.jpg"
          alt="Register Illustration"
          fill
          className="object-cover opacity-30 absolute top-0 left-0 z-0"
          priority
        />
        <div className="flex flex-col items-center text-center z-10">
          <h1 className="text-6xl font-bold mb-4 text-[#011f4b]">Welcome to RocketDrop</h1>
          <p className="text-lg mb-6 text-[#011f4b]">Join our platform and start selling globally with ease.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f1f5] to-[#e8f1f5] p-8 sm:p-12 rounded-l-3xl shadow-2xl">
        {/* 🧭 Back Button (clearly visible) */}
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 
             bg-white/80 text-[#004a7c] font-medium rounded-full 
             shadow-md hover:bg-white hover:shadow-lg 
             transition-all duration-200 cursor-pointer backdrop-blur-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="w-full max-w-md">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#2C5670] text-center mb-8">Create Your Account</h2>

          {/* Role Selector */}
          <div className="flex justify-center mb-6 space-x-4">
            {['user', 'supplier'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`cursor-pointer px-6 py-3 rounded-full font-medium border transition ${role === r
                  ? 'bg-gradient-to-r from-[#D7C6BC] to-[#2C5670] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}
          {success && <p className="text-green-600 text-center mb-4 font-medium">{success}</p>}

          <form onSubmit={handleRegister} className="grid grid-cols-1 gap-6">
            {role === 'user' ? (
              <>
                <FloatingInput name="name" label="Full Name*" onChange={handleChange} required />
                <FloatingInput name="email" type="email" label="Email*" onChange={handleChange} required />
                <FloatingInput name="password" type="password" label="Password*" onChange={handleChange} required />
                <FloatingInput name="phone" label="Phone*" onChange={handleChange} required />
                <FloatingInput name="address" label="Address*" onChange={handleChange} required />
              </>
            ) : (
              <>
                <FloatingInput name="company_name" label="Company Name*" onChange={handleChange} required />
                <FloatingInput name="email" type="email" label="Email*" onChange={handleChange} required />
                <FloatingInput name="password" type="password" label="Password*" onChange={handleChange} required />
                <FloatingInput name="phone" label="Phone*" onChange={handleChange} required />
                <FloatingInput name="address" label="Address*" onChange={handleChange} required />
                <FloatingInput name="gst_number" label="GST Number" onChange={handleChange} />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`cursor-pointer mt-4 bg-gradient-to-r from-[#004a7c] to-[#005691] text-white py-3 rounded-full font-semibold 
                hover:opacity-90 transition shadow-md flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#2C5670] font-medium hover:underline cursor-pointer">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FloatingInput({ name, type = 'text', label, onChange, required, className }) {
  return (
    <div className={`relative w-full ${className || ''}`}>
      <input
        type={type}
        name={name}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-3 text-gray-900 placeholder-transparent 
          focus:outline-none focus:ring-2 focus:ring-[#004a7c]/60 transition-all duration-200"
      />
      <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all duration-200
          peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
          peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#2C5670]
          peer-valid:top-2 peer-valid:text-sm peer-valid:text-[#2C5670]">
        {label}
      </label>
    </div>
  );
}
