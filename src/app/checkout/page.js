'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/button';
import { CheckCircle, ShoppingCart, CreditCard } from 'lucide-react';
import Lottie from 'lottie-react';
import parcelAnimation from '@/../public/lottie/Delivery car logistic.json';

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showAnimation, setShowAnimation] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // 🧩 Load user + cart
  useEffect(() => {
    console.log('Loading user and cart...');
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(u);

    const checkoutItem = JSON.parse(localStorage.getItem('checkoutItem') || 'null');
    if (checkoutItem) {
      console.log('Checkout item found:', checkoutItem);
      setCart([checkoutItem]);
      return;
    }

    if (u && u.email) {
      const saved = JSON.parse(localStorage.getItem(`cart_${u.email}`) || '[]');
      console.log('Cart found for user:', saved);
      setCart(saved);
    } else {
      const key = Object.keys(localStorage).find((k) => k.startsWith('cart_'));
      const saved = key ? JSON.parse(localStorage.getItem(key) || '[]') : [];
      console.log('Guest cart found:', saved);
      setCart(saved);
    }
  }, []);

  // 🧮 Totals
  const subtotal = cart.reduce(
    (s, item) => s + (Number(item.discountPrice ?? item.price) || 0) * (item.quantity || 1),
    0
  );
  const shippingCost = subtotal > 0 ? 0 : 0;
  const total = Number((subtotal + shippingCost).toFixed(2));

  // ✅ Validate form
  const validate = () => {
    console.log('Validating shipping form...');
    if (!cart.length) {
      toast.error('Your cart is empty.');
      return false;
    }

    const required = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode', 'country'];
    for (const f of required) {
      if (!shipping[f] || shipping[f].trim().length === 0) {
        toast.error(`Please fill ${f}`);
        console.log('Validation failed at:', f);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const postalRegex = /^[0-9]{4,6}$/;

    if (!emailRegex.test(shipping.email)) return toast.error('Invalid email');
    if (!phoneRegex.test(shipping.phone)) return toast.error('Invalid phone number');
    if (!postalRegex.test(shipping.postalCode)) return toast.error('Invalid postal code');

    console.log('Validation successful ✅');
    return true;
  };

  // 🧹 Clear user cart
  const clearUserCart = () => {
    console.log('Clearing user cart...');
    if (localStorage.getItem('checkoutItem')) {
      localStorage.removeItem('checkoutItem');
    } else if (user?.email) {
      localStorage.removeItem(`cart_${user.email}`);
    } else {
      const key = Object.keys(localStorage).find((k) => k.startsWith('cart_'));
      if (key) localStorage.removeItem(key);
    }
  };

  // 🧾 Place Order (COD only)
  const handlePlaceOrder = async () => {
    console.log('Placing order...');
    if (!validate()) return;
    setProcessing(true);

    try {
      const payload = {
        user_id: user?.id ?? null,
        shipping,
        items: cart.map((it) => ({
          product_id: it.id,
          name: it.name,
          price: Number(it.discountPrice ?? it.price),
          quantity: Number(it.quantity ?? 1),
        })),
        payment_method: 'cod',
        total,
      };

      console.log('Sending payload to backend:', payload);

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create order');
      const data = await res.json();

      console.log('Order created successfully:', data);

      setShowAnimation(true);
      clearUserCart();

      setTimeout(() => {
        router.push('/myorders');
      }, 4000);

      toast.success('Order placed successfully!');
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  // 🎉 Animation after order
  if (showAnimation) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 transition-opacity duration-700">
        <Lottie animationData={parcelAnimation} loop={false} className="w-96 h-96" />
        <p className="text-2xl font-semibold text-gray-700 mt-6">Order Placed Successfully!</p>
        <p className="text-gray-500 mt-2">Redirecting to My Orders...</p>
      </div>
    );
  }

  // 🧱 Checkout UI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 🧭 Progress Bar */}
      <div className="w-full bg-white shadow-sm py-6 px-10 flex justify-center">
        <div className="flex items-center w-full max-w-5xl justify-between text-sm font-medium">
          <div className="flex flex-col items-center text-blue-600">
            <ShoppingCart className="w-7 h-7" />
            <span className="mt-1">Cart</span>
          </div>
          <div className="flex-1 h-[2px] bg-blue-300 mx-2"></div>
          <div className="flex flex-col items-center text-blue-700 font-semibold">
            <CreditCard className="w-7 h-7" />
            <span className="mt-1">Checkout</span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>
          <div className="flex flex-col items-center text-gray-400">
            <CheckCircle className="w-7 h-7" />
            <span className="mt-1">Success</span>
          </div>
        </div>
      </div>

      {/* 🧱 Main Area */}
      <div className="flex-1 w-full py-10 px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
          {/* Left */}
          <div className="space-y-10">
            {/* Shipping */}
            <section className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { name: 'fullName', placeholder: 'Full Name' },
                  { name: 'email', placeholder: 'Email' },
                  { name: 'phone', placeholder: 'Phone Number' },
                  { name: 'postalCode', placeholder: 'Postal Code' },
                  { name: 'city', placeholder: 'City' },
                  { name: 'state', placeholder: 'State' },
                  { name: 'country', placeholder: 'Country' },
                ].map((f) => (
                  <input
                    key={f.name}
                    placeholder={f.placeholder}
                    value={shipping[f.name]}
                    onChange={(e) =>
                      setShipping({ ...shipping, [f.name]: e.target.value })
                    }
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                ))}
                <textarea
                  placeholder="Full Address"
                  value={shipping.address}
                  onChange={(e) =>
                    setShipping({ ...shipping, address: e.target.value })
                  }
                  rows="3"
                  className="col-span-1 md:col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            </section>

            {/* Payment (COD only) */}
            <section className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
                Payment Method
              </h3>
              <div className="space-y-4">
                <label className="flex items-start gap-4 p-5 border rounded-xl ring-2 ring-blue-300 bg-blue-50">
                  <input type="radio" checked readOnly className="mt-1 accent-blue-600" />
                  <div>
                    <div className="font-medium text-gray-800 text-base">💵 Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-600">Pay when you receive your order.</div>
                  </div>
                </label>

                {/* Disabled methods */}
                <label className="flex items-start gap-4 p-5 border rounded-xl opacity-50 cursor-not-allowed">
                  <div>
                    <div className="font-medium text-gray-800 text-base">📱 UPI / Razorpay (Coming Soon)</div>
                  </div>
                </label>
                <label className="flex items-start gap-4 p-5 border rounded-xl opacity-50 cursor-not-allowed">
                  <div>
                    <div className="font-medium text-gray-800 text-base">💳 Card / Stripe (Coming Soon)</div>
                  </div>
                </label>
              </div>
            </section>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-5">
              <Button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="flex-1 py-4 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-transform hover:scale-105"
              >
                {processing ? 'Processing...' : 'Place Order'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/cart')}
                className="flex-1 py-4 text-lg rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-transform hover:scale-105"
              >
                Back to Cart
              </Button>
            </div>
          </div>

          {/* Right: Summary */}
          <aside className="bg-white rounded-2xl shadow-lg p-8 sticky top-8 h-fit">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} × ₹{Number(item.discountPrice ?? item.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">
                    ₹{(Number(item.discountPrice ?? item.price) * Number(item.quantity)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-5 border-t mt-5 space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t pt-3 mt-3">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { toast } from 'react-hot-toast';
// import { Button } from '@/components/button';
// import { CheckCircle, ShoppingCart, CreditCard } from 'lucide-react';
// import Lottie from 'lottie-react';
// import parcelAnimation from '@/../public/lottie/Delivery car logistic.json';

// export default function CheckoutPage() {
//   const router = useRouter();

//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [processing, setProcessing] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState('cod');
//   const [showAnimation, setShowAnimation] = useState(false);

//   const [shipping, setShipping] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     address: '',
//     city: '',
//     state: '',
//     postalCode: '',
//     country: '',
//   });

//   // 🧩 Load user and cart
//   useEffect(() => {
//     console.log('🟡 useEffect → Loading user and cart from localStorage...');
//     const u = JSON.parse(localStorage.getItem('user') || 'null');
//     setUser(u);

//     const checkoutItem = JSON.parse(localStorage.getItem('checkoutItem') || 'null');
//     if (checkoutItem) {
//       console.log('✅ Found checkoutItem in localStorage:', checkoutItem);
//       setCart([checkoutItem]);
//       return;
//     }

//     if (u && u.email) {
//       const saved = JSON.parse(localStorage.getItem(`cart_${u.email}`) || '[]');
//       console.log('✅ Loaded cart for user:', saved);
//       setCart(saved);
//     } else {
//       const key = Object.keys(localStorage).find((k) => k.startsWith('cart_'));
//       const saved = key ? JSON.parse(localStorage.getItem(key) || '[]') : [];
//       console.log('✅ Loaded guest cart:', saved);
//       setCart(saved);
//     }
//   }, []);

//   // 🧮 Calculations
//   const subtotal = cart.reduce(
//     (s, item) => s + (Number(item.discountPrice ?? item.price) || 0) * (item.quantity || 1),
//     0
//   );
//   const shippingCost = subtotal > 0 ? 0 : 0;
//   const total = Number((subtotal + shippingCost).toFixed(2));

//   // ✅ Validate shipping
//   const validate = () => {
//     console.log('🔍 Validating shipping details...');
//     if (!cart || cart.length === 0) {
//       toast.error('Your cart is empty.');
//       console.warn('❌ Cart empty');
//       return false;
//     }

//     const required = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode', 'country'];
//     for (const f of required) {
//       if (!shipping[f] || shipping[f].toString().trim().length === 0) {
//         toast.error(`Please fill ${f}`);
//         console.warn(`❌ Missing field: ${f}`);
//         return false;
//       }
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneRegex = /^[0-9]{10}$/;
//     const postalRegex = /^[0-9]{4,6}$/;

//     if (!emailRegex.test(shipping.email)) {
//       console.warn('❌ Invalid email');
//       toast.error('Invalid email');
//       return false;
//     }
//     if (!phoneRegex.test(shipping.phone)) {
//       console.warn('❌ Invalid phone');
//       toast.error('Invalid phone number');
//       return false;
//     }
//     if (!postalRegex.test(shipping.postalCode)) {
//       console.warn('❌ Invalid postal code');
//       toast.error('Invalid postal code');
//       return false;
//     }

//     console.log('✅ Validation passed');
//     return true;
//   };

//   // 🧹 Clear user cart
//   const clearUserCart = () => {
//     console.log('🧹 Clearing user cart from localStorage...');
//     if (localStorage.getItem('checkoutItem')) {
//       localStorage.removeItem('checkoutItem');
//       console.log('🗑️ Removed checkoutItem');
//     } else if (user?.email) {
//       localStorage.removeItem(`cart_${user.email}`);
//       console.log('🗑️ Removed cart for user:', user.email);
//     } else {
//       const key = Object.keys(localStorage).find((k) => k.startsWith('cart_'));
//       if (key) {
//         localStorage.removeItem(key);
//         console.log('🗑️ Removed guest cart:', key);
//       }
//     }
//   };

//   // 🧾 Place Order
//   const handlePlaceOrder = async () => {
//     console.log('🟢 handlePlaceOrder triggered');
//     if (!validate()) {
//       console.log('❌ Validation failed — stopping');
//       return;
//     }

//     setProcessing(true);
//     console.log('🟡 Processing started...');

//     try {
//       const payload = {
//         user_id: user?.id ?? null,
//         shipping,
//         items: cart.map((it) => ({
//           product_id: it.id,
//           name: it.name,
//           price: Number(it.discountPrice ?? it.price),
//           quantity: Number(it.quantity ?? 1),
//         })),
//         payment_method: paymentMethod,
//         total,
//       };

//       console.log('📦 Sending order payload:', payload);

//       const res = await fetch('/api/orders/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       console.log('📨 Received response:', res.status);
//       if (!res.ok) throw new Error('Failed to create order');
//       const data = await res.json();
//       console.log('✅ Order created successfully:', data);

//       // 🎉 Success animation before redirect
//       console.log('🎬 Showing animation...');
//       setShowAnimation(true);
//       clearUserCart();

//       setTimeout(() => {
//         console.log('➡️ Redirecting to /my-orders');
//         router.push('/my-orders');
//       }, 2500);

//       toast.success('Order placed successfully!');
//     } catch (err) {
//       console.error('🔥 Error in handlePlaceOrder:', err);
//       toast.error(err.message || 'Something went wrong');
//     } finally {
//       setProcessing(false);
//       console.log('🔵 Processing finished');
//     }
//   };

//   // ✨ Show animation overlay
//   if (showAnimation) {
//     console.log('🎞️ Rendering success animation overlay');
//     return (
//       <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
//         <Lottie animationData={parcelAnimation} loop={false} className="w-96 h-96" />
//         <p className="text-2xl font-semibold text-gray-700 mt-6">Order Placed Successfully!</p>
//         <p className="text-gray-500 mt-2">Redirecting to My Orders...</p>
//       </div>
//     );
//   }

//   // 🧱 Main UI
//   console.log('🧱 Rendering CheckoutPage main UI');
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Progress Steps */}
//       <div className="w-full bg-white shadow-sm py-6 px-10 flex justify-center">
//         <div className="flex items-center w-full max-w-5xl justify-between text-sm font-medium">
//           <div className="flex flex-col items-center text-blue-600">
//             <ShoppingCart className="w-7 h-7" />
//             <span className="mt-1">Cart</span>
//           </div>
//           <div className="flex-1 h-[2px] bg-blue-300 mx-2"></div>
//           <div className="flex flex-col items-center text-blue-700 font-semibold">
//             <CreditCard className="w-7 h-7" />
//             <span className="mt-1">Checkout</span>
//           </div>
//           <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>
//           <div className="flex flex-col items-center text-gray-400">
//             <CheckCircle className="w-7 h-7" />
//             <span className="mt-1">Success</span>
//           </div>
//         </div>
//       </div>

//       {/* Checkout Content */}
//       <div className="flex-1 w-full py-10 px-10">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
//           {/* Left Section */}
//           <div className="space-y-10">
//             {/* Shipping Form */}
//             <section className="bg-white p-8 rounded-2xl shadow-lg">
//               <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
//                 Shipping Details
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 {[{ name: 'fullName', placeholder: 'Full Name' },
//                   { name: 'email', placeholder: 'Email' },
//                   { name: 'phone', placeholder: 'Phone Number' },
//                   { name: 'postalCode', placeholder: 'Postal Code' },
//                   { name: 'city', placeholder: 'City' },
//                   { name: 'state', placeholder: 'State' },
//                   { name: 'country', placeholder: 'Country' }].map((f) => (
//                   <input
//                     key={f.name}
//                     placeholder={f.placeholder}
//                     value={shipping[f.name]}
//                     onChange={(e) => setShipping({ ...shipping, [f.name]: e.target.value })}
//                     className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//                   />
//                 ))}
//                 <textarea
//                   placeholder="Full Address"
//                   value={shipping.address}
//                   onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
//                   rows="3"
//                   className="col-span-1 md:col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//                 />
//               </div>
//             </section>

//             {/* Payment Method */}
//             <section className="bg-white p-8 rounded-2xl shadow-lg">
//               <h3 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
//                 Payment Method
//               </h3>
//               <div className="space-y-4">
//                 {[{ id: 'cod', title: 'Cash on Delivery (COD)', desc: 'Pay when you receive it.', icon: '💵' },
//                   { id: 'razorpay', title: 'UPI / Razorpay', desc: 'Pay securely via Razorpay.', icon: '📱' },
//                   { id: 'stripe', title: 'Card / Wallet (Stripe)', desc: 'Pay internationally.', icon: '💳' }].map((method) => (
//                   <label
//                     key={method.id}
//                     className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition hover:shadow-md ${
//                       paymentMethod === method.id ? 'ring-2 ring-blue-300 bg-blue-50' : ''
//                     }`}
//                   >
//                     <input
//                       type="radio"
//                       name="payment"
//                       checked={paymentMethod === method.id}
//                       onChange={() => setPaymentMethod(method.id)}
//                       className="mt-1 accent-blue-600"
//                     />
//                     <div>
//                       <div className="font-medium text-gray-800 text-base">
//                         {method.icon} {method.title}
//                       </div>
//                       <div className="text-sm text-gray-600">{method.desc}</div>
//                     </div>
//                   </label>
//                 ))}
//               </div>
//             </section>

//             {/* Buttons */}
//             <div className="flex flex-col sm:flex-row gap-5">
//               <Button
//                 onClick={handlePlaceOrder}
//                 disabled={processing}
//                 className="flex-1 py-4 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-transform hover:scale-105"
//               >
//                 {processing ? 'Processing...' : 'Place Order'}
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={() => router.push('/cart')}
//                 className="flex-1 py-4 text-lg rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-transform hover:scale-105"
//               >
//                 Back to Cart
//               </Button>
//             </div>
//           </div>

//           {/* Right Section */}
//           <aside className="bg-white rounded-2xl shadow-lg p-8 sticky top-8 h-fit">
//             <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">Order Summary</h2>
//             <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
//               {cart.map((item) => (
//                 <div key={item.id} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
//                   <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
//                     {item.imageUrl ? (
//                       <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-800">{item.name}</div>
//                     <div className="text-sm text-gray-600">
//                       {item.quantity} × ₹{Number(item.discountPrice ?? item.price).toFixed(2)}
//                     </div>
//                   </div>
//                   <div className="font-semibold text-gray-900">
//                     ₹{(Number(item.discountPrice ?? item.price) * Number(item.quantity)).toFixed(2)}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Totals */}
//             <div className="pt-5 border-t mt-5 space-y-2 text-gray-700">
//               <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
//               <div className="flex justify-between"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span></div>
//               <div className="flex justify-between font-bold text-xl border-t pt-3 mt-3"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { toast } from 'react-hot-toast';
// import { Button } from '@/components/button';
// import { CheckCircle, ShoppingCart, CreditCard } from 'lucide-react';
// import Lottie from 'lottie-react';
// import parcelAnimation from '@/../public/lottie/Delivery car logistic.json';

// export default function CheckoutPage() {
//   const router = useRouter();

//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [processing, setProcessing] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState('cod');
//   const [showAnimation, setShowAnimation] = useState(false);

//   const [shipping, setShipping] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     address: '',
//     city: '',
//     state: '',
//     postalCode: '',
//     country: '',
//   });

//   // 🧩 Load user and cart
//   useEffect(() => {
//     const u = JSON.parse(localStorage.getItem('user') || 'null');
//     setUser(u);

//     const checkoutItem = JSON.parse(localStorage.getItem('checkoutItem') || 'null');
//     if (checkoutItem) {
//       setCart([checkoutItem]);
//       return;
//     }

//     if (u && u.email) {
//       const saved = JSON.parse(localStorage.getItem(`cart_${u.email}`) || '[]');
//       setCart(saved);
//     } else {
//       const key = Object.keys(localStorage).find((k) => k.startsWith('cart_'));
//       const saved = key ? JSON.parse(localStorage.getItem(key) || '[]') : [];
//       setCart(saved);
//     }
//   }, []);

//   // 🧮 Calculations
//   const subtotal = cart.reduce(
//     (s, item) => s + (Number(item.discountPrice ?? item.price) || 0) * (item.quantity || 1),
//     0
//   );
//   const shippingCost = subtotal > 0 ? 0 : 0;
//   const total = Number((subtotal + shippingCost).toFixed(2));

//   // ✅ Validate shipping
//   const validate = () => {
//     if (!cart || cart.length === 0) {
//       toast.error('Your cart is empty.');
//       return false;
//     }

//     const required = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode', 'country'];
//     for (const f of required) {
//       if (!shipping[f] || shipping[f].toString().trim().length === 0) {
//         toast.error(`Please fill ${f}`);
//         return false;
//       }
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneRegex = /^[0-9]{10}$/;
//     const postalRegex = /^[0-9]{4,6}$/;

//     if (!emailRegex.test(shipping.email)) return toast.error('Invalid email');
//     if (!phoneRegex.test(shipping.phone)) return toast.error('Invalid phone number');
//     if (!postalRegex.test(shipping.postalCode)) return toast.error('Invalid postal code');

//     return true;
//   };

//   // 🧹 Clear user cart
//   const clearUserCart = () => {
//     if (localStorage.getItem('checkoutItem')) {
//       localStorage.removeItem('checkoutItem');
//     } else if (user?.email) {
//       localStorage.removeItem(`cart_${user.email}`);
//     } else {
//       const key = Object.keys(localStorage).find((k) => k.startsWith('cart_'));
//       if (key) localStorage.removeItem(key);
//     }
//   };

//   // 🧾 Place Order
//   const handlePlaceOrder = async () => {
//     if (!validate()) return;
//     setProcessing(true);

//     try {
//       const payload = {
//         user_id: user?.id ?? null,
//         shipping,
//         items: cart.map((it) => ({
//           product_id: it.id,
//           name: it.name,
//           price: Number(it.discountPrice ?? it.price),
//           quantity: Number(it.quantity ?? 1),
//         })),
//         payment_method: paymentMethod,
//         total,
//       };

//       const res = await fetch('/api/orders/create', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error('Failed to create order');
//       const data = await res.json();

//       // 🎉 Success animation before redirect
//       setShowAnimation(true);
//       clearUserCart();
//       setTimeout(() => {
//         router.push('/my-orders');
//       }, 2500);

//       toast.success('Order placed successfully!');
//     } catch (err) {
//       console.error(err);
//       toast.error(err.message || 'Something went wrong');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   // ✨ Show animation overlay when order is placed
//   if (showAnimation) {
//     return (
//       <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
//         <Lottie animationData={parcelAnimation} loop={false} className="w-96 h-96" />
//         <p className="text-2xl font-semibold text-gray-700 mt-6">Order Placed Successfully!</p>
//         <p className="text-gray-500 mt-2">Redirecting to My Orders...</p>
//       </div>
//     );
//   }

//   // 🧱 Main UI
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Progress Steps */}
//       <div className="w-full bg-white shadow-sm py-6 px-10 flex justify-center">
//         <div className="flex items-center w-full max-w-5xl justify-between text-sm font-medium">
//           <div className="flex flex-col items-center text-blue-600">
//             <ShoppingCart className="w-7 h-7" />
//             <span className="mt-1">Cart</span>
//           </div>
//           <div className="flex-1 h-[2px] bg-blue-300 mx-2"></div>
//           <div className="flex flex-col items-center text-blue-700 font-semibold">
//             <CreditCard className="w-7 h-7" />
//             <span className="mt-1">Checkout</span>
//           </div>
//           <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>
//           <div className="flex flex-col items-center text-gray-400">
//             <CheckCircle className="w-7 h-7" />
//             <span className="mt-1">Success</span>
//           </div>
//         </div>
//       </div>

//       {/* Checkout Content */}
//       <div className="flex-1 w-full py-10 px-10">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
//           {/* Left Section */}
//           <div className="space-y-10">
//             {/* Shipping Form */}
//             <section className="bg-white p-8 rounded-2xl shadow-lg">
//               <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
//                 Shipping Details
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 {[
//                   { name: 'fullName', placeholder: 'Full Name' },
//                   { name: 'email', placeholder: 'Email' },
//                   { name: 'phone', placeholder: 'Phone Number' },
//                   { name: 'postalCode', placeholder: 'Postal Code' },
//                   { name: 'city', placeholder: 'City' },
//                   { name: 'state', placeholder: 'State' },
//                   { name: 'country', placeholder: 'Country' },
//                 ].map((f) => (
//                   <input
//                     key={f.name}
//                     placeholder={f.placeholder}
//                     value={shipping[f.name]}
//                     onChange={(e) =>
//                       setShipping({ ...shipping, [f.name]: e.target.value })
//                     }
//                     className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//                   />
//                 ))}
//                 <textarea
//                   placeholder="Full Address"
//                   value={shipping.address}
//                   onChange={(e) =>
//                     setShipping({ ...shipping, address: e.target.value })
//                   }
//                   rows="3"
//                   className="col-span-1 md:col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
//                 />
//               </div>
//             </section>

//             {/* Payment Method */}
//             <section className="bg-white p-8 rounded-2xl shadow-lg">
//               <h3 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
//                 Payment Method
//               </h3>
//               <div className="space-y-4">
//                 {[
//                   { id: 'cod', title: 'Cash on Delivery (COD)', desc: 'Pay when you receive it.', icon: '💵' },
//                   { id: 'razorpay', title: 'UPI / Razorpay', desc: 'Pay securely via Razorpay.', icon: '📱' },
//                   { id: 'stripe', title: 'Card / Wallet (Stripe)', desc: 'Pay internationally.', icon: '💳' },
//                 ].map((method) => (
//                   <label
//                     key={method.id}
//                     className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition hover:shadow-md ${
//                       paymentMethod === method.id ? 'ring-2 ring-blue-300 bg-blue-50' : ''
//                     }`}
//                   >
//                     <input
//                       type="radio"
//                       name="payment"
//                       checked={paymentMethod === method.id}
//                       onChange={() => setPaymentMethod(method.id)}
//                       className="mt-1 accent-blue-600"
//                     />
//                     <div>
//                       <div className="font-medium text-gray-800 text-base">
//                         {method.icon} {method.title}
//                       </div>
//                       <div className="text-sm text-gray-600">{method.desc}</div>
//                     </div>
//                   </label>
//                 ))}
//               </div>
//             </section>

//             {/* Buttons */}
//             <div className="flex flex-col sm:flex-row gap-5">
//               <Button
//                 onClick={handlePlaceOrder}
//                 disabled={processing}
//                 className="flex-1 py-4 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-transform hover:scale-105"
//               >
//                 {processing ? 'Processing...' : 'Place Order'}
//               </Button>
//               <Button
//                 variant="outline"
//                 onClick={() => router.push('/cart')}
//                 className="flex-1 py-4 text-lg rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-transform hover:scale-105"
//               >
//                 Back to Cart
//               </Button>
//             </div>
//           </div>

//           {/* Right Section */}
//           <aside className="bg-white rounded-2xl shadow-lg p-8 sticky top-8 h-fit">
//             <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
//               Order Summary
//             </h2>

//             <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
//               {cart.map((item) => (
//                 <div key={item.id} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
//                   <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
//                     {item.imageUrl ? (
//                       <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
//                         No image
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-800">{item.name}</div>
//                     <div className="text-sm text-gray-600">
//                       {item.quantity} × ₹{Number(item.discountPrice ?? item.price).toFixed(2)}
//                     </div>
//                   </div>
//                   <div className="font-semibold text-gray-900">
//                     ₹{(Number(item.discountPrice ?? item.price) * Number(item.quantity)).toFixed(2)}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Totals */}
//             <div className="pt-5 border-t mt-5 space-y-2 text-gray-700">
//               <div className="flex justify-between">
//                 <span>Subtotal</span>
//                 <span>₹{subtotal.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Shipping</span>
//                 <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
//               </div>
//               <div className="flex justify-between font-bold text-xl border-t pt-3 mt-3">
//                 <span>Total</span>
//                 <span>₹{total.toFixed(2)}</span>
//               </div>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }
