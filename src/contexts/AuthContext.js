'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { mergeGuestCartToUser } from '@/hooks/useCart';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Auto-refresh access token before expiry
  useEffect(() => {
    if (!user) return;

    // Refresh token every 50 minutes (before 1-hour expiry)
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user) {
            // Update user data in state (token in cookie auto-updated)
            setUser(data.data.user);
            localStorage.setItem('user', JSON.stringify(data.data.user));
          }
        } else {
          // Refresh failed - logout user
          console.warn('Token refresh failed, logging out');
          logout();
        }
      } catch (err) {
        console.error('Token refresh error:', err);
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Validate stored user data
          if (parsedUser?.email && parsedUser?.role) {
            // Verify token is still valid by calling refresh
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.user) {
                setUser(data.data.user);
                localStorage.setItem('user', JSON.stringify(data.data.user));
              } else {
                // Token invalid, clear storage
                localStorage.removeItem('user');
              }
            } else {
              // Token expired, clear storage
              localStorage.removeItem('user');
            }
          } else {
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        localStorage.removeItem('user');
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  // ✅ Redirect user to their dashboard only on first load
  useEffect(() => {
    if (!isInitialized || !user) return;

    const publicRoutes = ['/', '/login'];
    if (publicRoutes.includes(pathname)) {
      if (user.role === 'admin') router.replace('/admin/admin-dashboard');
      else if (user.role === 'user') router.replace('/user-dashboard');
    }
  }, [isInitialized, user, pathname, router]);

  // ✅ Login handler (with cart merge)
  const login = useCallback((userData) => {
    if (!userData?.role || !userData?.email) return;

    // 1️⃣ Save user to state & localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    // 2️⃣ Merge guest cart → user cart
    try {
      mergeGuestCartToUser(userData);
    } catch (err) {
      console.error('Error merging guest cart:', err);
    }

    // 3️⃣ Redirect user after login (JWT already in cookie from API)
    if (userData.role === 'admin') router.replace('/admin/admin-dashboard');
    else router.replace('/user-dashboard');
  }, [router]);

  // ✅ Logout handler
  const logout = useCallback(async () => {
    try {
      // Call logout API to clear cookies (create this endpoint)
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Clear local state regardless of API result
      setUser(null);
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

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
