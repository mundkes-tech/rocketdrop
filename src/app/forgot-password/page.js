'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Email verified! Redirecting...');
        setTimeout(() => {
          router.push(`/change-password?role=${role}&email=${email}`);
        }, 1500);
      } else {
        setError(data.error || 'Email not found');
      }
    } catch (err) {
      setError('Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-3xl font-semibold text-center mb-6 text-blue-300">
          Forgot Password
        </h2>

        {/* Role Selector */}
        <div className="flex justify-center mb-6 space-x-4">
          {['user', 'supplier'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-5 py-2 rounded-lg font-medium border transition cursor-pointer ${
                role === r
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-white/10 text-blue-200 border-blue-300 hover:bg-white/20'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        {message && <p className="text-green-400 text-sm mb-4 text-center">{message}</p>}

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
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
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
