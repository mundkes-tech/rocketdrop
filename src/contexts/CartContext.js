'use client';
import { createContext, useContext } from 'react';
import { useCart } from '@/hooks/useCart';

// Create context
const CartContext = createContext(null);

// Provider
export function CartProvider({ children }) {
  const cartHook = useCart(); // our custom hook logic
  return (
    <CartContext.Provider value={cartHook}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to access it easily
export const useCartContext = () => useContext(CartContext);
