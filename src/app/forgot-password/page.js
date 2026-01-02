'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmailSent(true);
        setMessage(data.message);
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1128] via-[#001F54] to-[#034078] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A1128] via-[#001F54] to-[#034078] px-4"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg border border-white/10 text-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold text-blue-300">
            Forgot Password?
          </h2>
          <p className="text-blue-200 text-sm mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}
        
        {message && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
            <p className="text-green-200 text-sm text-center">{message}</p>
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
          className="w-full border border-white/20 bg-white/5 text-white placeholder-blue-200 mb-5 rounded-md px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none transition"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-lg font-medium transition cursor-pointer ${
            loading
              ? 'bg-blue-400 text-white opacity-70 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:scale-[1.02]'
          }`}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-blue-300 hover:text-blue-200 text-sm font-medium transition"
          >
            ← Back to Login
          </Link>
        </div>
      </form>
    </motion.div>
  );
}


// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function ForgotPasswordPage() {
//   const router = useRouter();
//   const [role, setRole] = useState('user');
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setError('');

//     try {
//       const res = await fetch('/api/forgot-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ role, email }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage('Email verified! Redirecting...');
//         setTimeout(() => {
//           router.push(`/change-password?role=${role}&email=${email}`);
//         }, 1500);
//       } else {
//         setError(data.error || 'Email not found');
//       }
//     } catch (err) {
//       setError('Server error, please try again.');
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
//       >
//         <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
//           Forgot Password
//         </h2>

//         {/* Role Selector */}
//         <div className="flex justify-center mb-6 space-x-4">
//           <button
//             type="button"
//             onClick={() => setRole('user')}
//             className={`px-4 py-2 rounded-lg font-medium border ${
//               role === 'user'
//                 ? 'bg-blue-600 text-white border-blue-600'
//                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//             }`}
//           >
//             User
//           </button>
//           <button
//             type="button"
//             onClick={() => setRole('supplier')}
//             className={`px-4 py-2 rounded-lg font-medium border ${
//               role === 'supplier'
//                 ? 'bg-blue-600 text-white border-blue-600'
//                 : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//             }`}
//           >
//             Supplier
//           </button>
//         </div>

//         {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
//         {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}

//         <input
//           type="email"
//           name="email"
//           placeholder="Enter your registered email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           className="w-full border mb-4 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
//         />

//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
//         >
//           Verify Email
//         </button>
//       </form>
//     </div>
//   );
// }
