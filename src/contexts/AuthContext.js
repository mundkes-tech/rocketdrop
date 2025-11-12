'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { mergeGuestCart } from '@/hooks/useCart'; // ✅ import merge helper

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Load user from localStorage safely
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        // Minimal validation before trusting
        if (parsedUser?.email && parsedUser?.role) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('user');
        }
      }
    } catch (err) {
      console.warn('Invalid user data in localStorage — clearing it.');
      localStorage.removeItem('user');
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // ✅ Redirect user to their dashboard only on first load
  useEffect(() => {
    if (!isInitialized || !user) return;

    const publicRoutes = ['/', '/login', '/supplier-login'];
    if (publicRoutes.includes(pathname)) {
      if (user.role === 'supplier') router.replace('/supplier-dashboard');
      else if (user.role === 'user') router.replace('/user-dashboard');
    }
  }, [isInitialized]); // no pathname dependency → avoids redirect loops

  // ✅ Persist user state in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // ✅ Login handler (with cart merge)
  const login = (userData) => {
    if (!userData?.role || !userData?.email) return;

    // 1️⃣ Save user to state & localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    // 2️⃣ Merge guest cart → user cart (e.g. cart_guest → cart_user@gmail.com)
    try {
      mergeGuestCart(userData);
    } catch (err) {
      console.error('Error merging guest cart:', err);
    }

    // 3️⃣ Redirect user after login
    if (userData.role === 'supplier') router.replace('/supplier-dashboard');
    else router.replace('/user-dashboard');
  };

  // ✅ Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');

    // Graceful redirect to correct login page
    if (pathname.startsWith('/supplier-dashboard')) router.push('/supplier-login');
    else router.push('/login');
  };

  // 🌀 Loader while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-[#004a7c] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // ✅ Provide context
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook for easy access
export const useAuth = () => useContext(AuthContext);





// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const router = useRouter();

//   // ✅ Load user from localStorage on app start
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       const parsedUser = JSON.parse(storedUser);
//       setUser(parsedUser);

//       // ✅ Auto-redirect based on role
//       if (parsedUser.role === 'supplier') {
//         router.push('/supplier-dashboard');
//       } else if (parsedUser.role === 'user') {
//         router.push('/');
//       }
//     }
//   }, []);

//   // ✅ Sync user state to localStorage
//   useEffect(() => {
//     if (user) localStorage.setItem('user', JSON.stringify(user));
//     else localStorage.removeItem('user');
//   }, [user]);

//   const login = (userData) => setUser(userData);
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//     router.push('/login');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ✅ Custom hook to access auth
// export const useAuth = () => useContext(AuthContext);



// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   // ✅ Load user from localStorage when the app starts
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   // ✅ Save user to localStorage when it changes
//   useEffect(() => {
//     if (user) localStorage.setItem('user', JSON.stringify(user));
//     else localStorage.removeItem('user');
//   }, [user]);

//   const login = (userData) => setUser(userData);
//   const logout = () => setUser(null);

//   return (
//     <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ✅ Custom hook to use auth anywhere
// export const useAuth = () => useContext(AuthContext);
