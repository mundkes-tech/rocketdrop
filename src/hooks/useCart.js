'use client';
import { useState, useEffect, useCallback } from 'react';

// ✅ Your custom hook
export function useCart() {
  const [cart, setCart] = useState([]);

  // 🧠 Load cart initially (guest cart)
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart_guest') || '[]');
      setCart(Array.isArray(stored) ? stored : []);
    } catch {
      setCart([]);
    }
  }, []);

  // 🧩 Get proper storage key
  const getCartKey = useCallback((user) => {
    return user?.email ? `cart_${user.email}` : 'cart_guest';
  }, []);

  // 🛒 Get cart safely
  const getCart = useCallback((user) => {
    try {
      const key = getCartKey(user);
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }, [getCartKey]);

  // 💾 Save cart (local only)
  const saveCart = useCallback(
    (user, items) => {
      const key = getCartKey(user);
      const safeItems = Array.isArray(items) ? items : [];
      localStorage.setItem(key, JSON.stringify(safeItems));
      setCart(safeItems);
    },
    [getCartKey]
  );

  // ➕ Add item
  const addToCart = useCallback(
    async (product, user, quantity = 1) => {
      try {
        const key = getCartKey(user);
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const items = Array.isArray(existing) ? existing : [];

        const index = items.findIndex((i) => i.id === product.id);
        if (index !== -1) {
          items[index].quantity += quantity;
        } else {
          items.push({ ...product, quantity });
        }

        localStorage.setItem(key, JSON.stringify(items));
        setCart(items);

        // ✅ Also sync with DB if logged in
        if (user?.id) {
          await syncCartWithDB(user.id, items);
        }
      } catch (err) {
        console.error('❌ Error adding to cart:', err);
      }
    },
    [getCartKey]
  );

  // ❌ Remove item
  const removeFromCart = useCallback(
    async (id, user) => {
      const key = getCartKey(user);
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = Array.isArray(existing)
        ? existing.filter((i) => i.id !== id)
        : [];
      localStorage.setItem(key, JSON.stringify(updated));
      setCart(updated);

      // ✅ Update DB if logged in
      if (user?.id) {
        await syncCartWithDB(user.id, updated);
      }
    },
    [getCartKey]
  );

  // 🧹 Clear cart
  const clearCart = useCallback(
    async (user) => {
      const key = getCartKey(user);
      localStorage.removeItem(key);
      setCart([]);

      // ✅ Clear DB if logged in
      if (user?.id) {
        try {
          await fetch(`/api/cart?userId=${user.id}`, { method: 'DELETE', credentials: 'include' });
        } catch (err) {
          console.error('❌ Error clearing cart in DB:', err);
        }
      }
    },
    [getCartKey]
  );

  // 🔢 Count total items
  const getItemsCount = useCallback(() => {
    return Array.isArray(cart)
      ? cart.reduce((count, item) => count + (item.quantity || 1), 0)
      : 0;
  }, [cart]);

  // 💰 Total price
  const getTotalPrice = useCallback(() => {
    return Array.isArray(cart)
      ? cart.reduce(
          (total, item) =>
            total +
            Number(item.discountPrice ?? item.price) * (item.quantity || 1),
          0
        )
      : 0;
  }, [cart]);

  return {
    cart,
    setCart,
    getCart,
    saveCart,
    addToCart,
    removeFromCart,
    clearCart,
    getItemsCount,
    getTotalPrice,
  };
}

// 🔄 --- Helper Functions ---

// 🧠 Merge guest cart → DB after login
export async function mergeGuestCartToUser(user) {
  if (!user?.id) return;

  try {
    const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]');
    if (guestCart.length === 0) return;

    // Get existing DB cart
    const res = await fetch(`/api/cart?userId=${user.id}`, { credentials: 'include' });
    const data = await res.json();
    const dbCart = Array.isArray(data.cart) ? data.cart : [];

    // Merge logic
    const merged = [...dbCart];
    guestCart.forEach((item) => {
      const existing = merged.find((p) => p.id === item.id);
      if (existing) existing.quantity += item.quantity;
      else merged.push(item);
    });

    // Save merged cart to DB
    await syncCartWithDB(user.id, merged);

    // ✅ Clear guest cart
    localStorage.removeItem('cart_guest');
    console.log('✅ Guest cart merged to DB for user:', user.email);
  } catch (err) {
    console.error('❌ Error merging guest cart to DB:', err);
  }
}

// 🧾 Sync cart to database
export async function syncCartWithDB(userId, cartData) {
  if (!userId || !Array.isArray(cartData)) return;
  try {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, cartData }),
    });
  } catch (err) {
    console.error('❌ Error syncing cart to DB:', err);
  }
}


// 'use client';
// import { useState, useEffect, useCallback } from 'react';

// export function useCart() {
//   const [cart, setCart] = useState([]);

//   // 🧠 Load cart initially from localStorage (guest by default)
//   useEffect(() => {
//     try {
//       const stored = JSON.parse(localStorage.getItem('cart_guest') || '[]');
//       setCart(Array.isArray(stored) ? stored : []);
//     } catch {
//       setCart([]);
//     }
//   }, []);

//   // 🧩 Stable key generator
//   const getCartKey = useCallback((user) => {
//     return user?.email ? `cart_${user.email}` : 'cart_guest';
//   }, []);

//   // 🛒 Get cart (safe + pure)
//   const getCart = useCallback((user) => {
//     try {
//       const key = getCartKey(user);
//       const stored = JSON.parse(localStorage.getItem(key) || '[]');
//       return Array.isArray(stored) ? stored : [];
//     } catch {
//       return [];
//     }
//   }, [getCartKey]);

//   // 💾 Save cart
//   const saveCart = useCallback(
//     (user, items) => {
//       const key = getCartKey(user);
//       const safeItems = Array.isArray(items) ? items : [];
//       localStorage.setItem(key, JSON.stringify(safeItems));
//       setCart(safeItems);
//     },
//     [getCartKey]
//   );

//   // ➕ Add to cart
//   const addToCart = useCallback(
//     (product, user) => {
//       try {
//         const key = getCartKey(user);
//         const existing = JSON.parse(localStorage.getItem(key) || '[]');
//         const items = Array.isArray(existing) ? existing : [];

//         const index = items.findIndex((i) => i.id === product.id);
//         if (index !== -1) {
//           items[index].quantity += 1;
//         } else {
//           items.push({ ...product, quantity: 1 });
//         }

//         localStorage.setItem(key, JSON.stringify(items));
//         setCart(items);
//       } catch (err) {
//         console.error('❌ Error adding to cart:', err);
//       }
//     },
//     [getCartKey]
//   );

//   // ❌ Remove item
//   const removeFromCart = useCallback(
//     (id, user) => {
//       const key = getCartKey(user);
//       const existing = JSON.parse(localStorage.getItem(key) || '[]');
//       const updated = Array.isArray(existing)
//         ? existing.filter((i) => i.id !== id)
//         : [];
//       localStorage.setItem(key, JSON.stringify(updated));
//       setCart(updated);
//     },
//     [getCartKey]
//   );

//   // 🧹 Clear cart
//   const clearCart = useCallback(
//     (user) => {
//       const key = getCartKey(user);
//       localStorage.removeItem(key);
//       setCart([]);
//     },
//     [getCartKey]
//   );

//   // 🔢 Count total items
//   const getItemsCount = useCallback(() => {
//     return Array.isArray(cart)
//       ? cart.reduce((count, item) => count + (item.quantity || 1), 0)
//       : 0;
//   }, [cart]);

//   // 💰 Total price
//   const getTotalPrice = useCallback(() => {
//     return Array.isArray(cart)
//       ? cart.reduce(
//           (total, item) =>
//             total +
//             Number(item.discountPrice ?? item.price) * (item.quantity || 1),
//           0
//         )
//       : 0;
//   }, [cart]);

//   return {
//     cart,
//     setCart,
//     getCart,
//     saveCart,
//     addToCart,
//     removeFromCart,
//     clearCart,
//     getItemsCount,
//     getTotalPrice,
//   };
// }

// // 🔄 Helper exports for merging guest cart after login
// export function getCartKey(user) {
//   return user?.email ? `cart_${user.email}` : 'cart_guest';
// }

// export function getCart(user) {
//   try {
//     const key = getCartKey(user);
//     return JSON.parse(localStorage.getItem(key)) || [];
//   } catch {
//     return [];
//   }
// }

// export function saveCart(user, cart) {
//   const key = getCartKey(user);
//   localStorage.setItem(key, JSON.stringify(cart));
// }

// export function mergeGuestCart(user) {
//   if (!user) return;
//   const guestCart = getCart(null);
//   const userCart = getCart(user);
//   const merged = [...userCart];

//   guestCart.forEach((item) => {
//     const existing = merged.find((p) => p.id === item.id);
//     if (existing) existing.quantity += item.quantity;
//     else merged.push(item);
//   });

//   saveCart(user, merged);
//   localStorage.removeItem('cart_guest');
// }






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
