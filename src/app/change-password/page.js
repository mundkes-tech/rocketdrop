'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ChangePasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get('role');
  const email = params.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, newPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage('Password changed successfully! Redirecting...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setLoading(false);
      setError('Server error. Try again later.');
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gray-100 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
          Change Password
        </h2>

        {error && (
          <motion.p
            className="text-red-500 text-sm mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
        {message && (
          <motion.p
            className="text-green-600 text-sm mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.p>
        )}

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full border mb-3 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border mb-4 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition 
                      cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </motion.form>
    </motion.div>
  );
}


// 'use client';

// import { useSearchParams, useRouter } from 'next/navigation';
// import { useState } from 'react';

// export default function ChangePasswordPage() {
//   const router = useRouter();
//   const params = useSearchParams();
//   const role = params.get('role');
//   const email = params.get('email');

//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage('');
//     setError('');

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match!');
//       return;
//     }

//     try {
//       const res = await fetch('/api/change-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ role, email, newPassword }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage('Password changed successfully! Redirecting...');
//         setTimeout(() => router.push('/login'), 1500);
//       } else {
//         setError(data.error || 'Failed to change password');
//       }
//     } catch (err) {
//       setError('Server error. Try again later.');
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
//       >
//         <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
//           Change Password
//         </h2>

//         {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
//         {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}

//         <input
//           type="password"
//           placeholder="New Password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//           className="w-full border mb-3 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
//         />

//         <input
//           type="password"
//           placeholder="Confirm Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           required
//           className="w-full border mb-4 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
//         />

//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
//         >
//           Update Password
//         </button>
//       </form>
//     </div>
//   );
// }
