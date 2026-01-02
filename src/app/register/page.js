'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const indianStates = [
    "Maharashtra", "Gujarat", "Rajasthan", "Karnataka", "Delhi",
    "Tamil Nadu", "Uttar Pradesh", "Madhya Pradesh", "West Bengal",
    "Punjab", "Haryana", "Bihar", "Kerala"
  ];

  // 📍 Auto-fill city & state using pincode API
  const fetchCityState = async (pincode) => {
    if (pincode.length !== 6) return;

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();

      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setForm((prev) => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State,
        }));
      }
    } catch (err) {
      console.error("Pincode API error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "pincode") fetchCityState(value);
  };

  const validateForm = () => {
    if (!form.name) return 'Full name is required';
    if (!form.email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email';
    if (!form.password || form.password.length < 6)
      return 'Password must be at least 6 chars';
    if (!form.phone || !/^\d{10}$/.test(form.phone))
      return 'Phone number must be 10 digits';
    if (!form.address) return 'Address is required';
    if (!form.pincode || form.pincode.length !== 6) return 'Pincode must be 6 digits';
    if (!form.city) return 'City is required';
    if (!form.state) return 'State is required';
    if (!form.gender) return 'Gender is required';
    return '';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', ...form }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || 'Registration successful!');
        // Auto-login and redirect immediately
        try {
          const userData = data.user;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            router.replace('/user-dashboard');
          } else {
            // If no auto-login, go to login page
            setTimeout(() => router.push('/login'), 500);
          }
        } catch {
          setTimeout(() => router.push('/login'), 500);
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Server error, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">

      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 h-screen relative bg-gradient-to-br from-[#004a7c] to-[#e8f1f5] p-12 overflow-hidden">
        <Image src="/Images/form.jpg" alt="Register" fill className="object-cover opacity-30 absolute" />
        <div className="z-10 text-center">
          <h1 className="text-6xl font-bold text-[#011f4b]">Welcome to RocketDrop</h1>
          <p className="text-lg text-[#011f4b] mt-4">Start your shopping journey!</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative w-full md:w-1/2 h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0A1128] via-[#001F54] to-[#034078] p-8 sm:p-12">

        {/* Title */}
        <h2 className="text-4xl font-bold text-white mb-10 text-center">
          Create your RocketDrop Account
        </h2>

        {error && <p className="text-red-300 text-center mb-4">{error}</p>}
        {success && <p className="text-green-300 text-center mb-4">{success}</p>}

        {/* FORM */}
        <form
          onSubmit={handleRegister}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl"
        >

          <FloatingInput name="name" label="Full Name*" onChange={handleChange} required />
          <FloatingInput name="email" type="email" label="Email*" onChange={handleChange} required />

          <FloatingInput name="password" type="password" label="Password*" onChange={handleChange} required />
          <FloatingInput name="phone" label="Phone Number*" onChange={handleChange} required />

          {/* FULL WIDTH INPUTS */}
          <FloatingInput name="address" label="Address*" onChange={handleChange} className="col-span-2" required />
          <FloatingInput name="pincode" label="Pincode*" onChange={handleChange} required />

          {/* CITY */}
          <FloatingInput
            name="city"
            label="City*"
            value={form.city || ""}
            onChange={handleChange}
            required
          />

          {/* STATE DROPDOWN */}
          <div className="flex flex-col col-span-2 sm:col-span-1">
            <label className="text-blue-200 text-sm mb-1">State*</label>
            <select
              name="state"
              value={form.state || ""}
              onChange={handleChange}
              className="w-full border border-white/20 bg-white/10 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="" className="text-black">Select State</option>
              {indianStates.map((st) => (
                <option key={st} value={st} className="text-black">{st}</option>
              ))}
            </select>
          </div>

          {/* GENDER */}
          <div className="col-span-2">
            <label className="text-blue-200 text-sm mb-2">Gender*</label>
            <div className="flex gap-8">
              {["male", "female", "other"].map((g) => (
                <label key={g} className="flex items-center gap-2 text-white">
                  <input type="radio" name="gender" value={g} onChange={handleChange} required />
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="col-span-2 mt-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-3 rounded-full shadow-md hover:scale-[1.02] transition"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="col-span-2 text-center text-blue-200 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-300 hover:underline">
              Login
            </Link>
          </p>

        </form>
      </div>

    </div>
  );
}

function FloatingInput({ name, type = 'text', label, value, onChange, required, className }) {
  return (
    <div className={`relative w-full ${className}`}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        className="peer w-full border border-white/20 bg-white/10 rounded-lg px-4 pt-5 pb-3
                   text-white placeholder-transparent focus:outline-none 
                   focus:ring-2 focus:ring-blue-400 transition-all"
      />
      <label className="absolute left-4 top-3 text-blue-200 text-sm transition-all
                       peer-placeholder-shown:top-5 peer-placeholder-shown:text-base
                       peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-300">
        {label}
      </label>
    </div>
  );
}

