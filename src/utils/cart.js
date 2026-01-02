export function getCartKey(user) {
  return user ? `cart_${user.email}` : 'cart_guest';
}

export function getCart(user) {
  try {
    const key = getCartKey(user);
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function saveCart(user, cart) {
  const key = getCartKey(user);
  localStorage.setItem(key, JSON.stringify(cart));
}

export function mergeGuestCart(user) {
  if (!user) return;

  const guestCart = getCart(null);
  const userCart = getCart(user);

  const merged = [...userCart];

  guestCart.forEach((item) => {
    const existing = merged.find((p) => p.id === item.id);
    if (existing) existing.quantity += item.quantity;
    else merged.push(item);
  });

  saveCart(user, merged);
  localStorage.removeItem('cart_guest');
}
