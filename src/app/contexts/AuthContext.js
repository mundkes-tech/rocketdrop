'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // ✅ Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // ✅ Auto-redirect based on role
      if (parsedUser.role === 'supplier') {
        router.push('/supplier-dashboard');
      } else if (parsedUser.role === 'user') {
        router.push('/');
      }
    }
  }, []);

  // ✅ Sync user state to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = (userData) => setUser(userData);
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook to access auth
export const useAuth = () => useContext(AuthContext);



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
