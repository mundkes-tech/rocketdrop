'use client';
import { useState, useEffect } from 'react';

export function useCart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Example: load from localStorage
    const saved = JSON.parse(localStorage.getItem('cart') || '[]');
    setItems(saved);
  }, []);

  const addItem = (item) => {
    const updated = [...items, item];
    setItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const getItemsCount = () => items.length;

  return { items, addItem, getItemsCount };
}
