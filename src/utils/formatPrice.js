export function formatPrice(price) {
  if (price == null || price === '') return '';
  const num = Number(price);
  if (isNaN(num)) return ''; // handle invalid numeric values gracefully
  return `$${num.toFixed(2)}`;
}
