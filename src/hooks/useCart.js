'use client';
import { useState, useEffect, useCallback } from 'react';

export function useCart() {
  const [items, setItems] = useState([]);
  const [userEmail, setUserEmail] = useState(null);

  // 🧠 Get current user email from localStorage (auth context can also provide it)
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUserEmail(userData?.email || null);
  }, []);

  // 🔁 Load user's cart on mount
  useEffect(() => {
    if (!userEmail) return;
    const saved = JSON.parse(localStorage.getItem(`cart_${userEmail}`) || '[]');
    setItems(saved);
  }, [userEmail]);

  // 💾 Save cart automatically when items change
  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(`cart_${userEmail}`, JSON.stringify(items));
  }, [items, userEmail]);

  // 🛒 Add or update item
  const addItem = useCallback((item) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  // ➖ Remove an item
  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 🧹 Clear cart
  const clearCart = useCallback(() => setItems([]), []);

  // 📊 Get item count
  const getItemsCount = useCallback(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  // 💰 Calculate total price
  const getTotal = useCallback(
    () =>
      items.reduce(
        (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
        0
      ),
    [items]
  );

  return { items, addItem, removeItem, clearCart, getItemsCount, getTotal };
}



// 'use client';
// import { useState, useEffect } from 'react';

// export function useCart() {
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     // Example: load from localStorage
//     const saved = JSON.parse(localStorage.getItem('cart') || '[]');
//     setItems(saved);
//   }, []);

//   const addItem = (item) => {
//     const updated = [...items, item];
//     setItems(updated);
//     localStorage.setItem('cart', JSON.stringify(updated));
//   };

//   const getItemsCount = () => items.length;

//   return { items, addItem, getItemsCount };
// }
