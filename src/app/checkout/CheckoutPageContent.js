'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/button';
import { CheckCircle, ShoppingCart, CreditCard } from 'lucide-react';
import Lottie from 'lottie-react';
import parcelAnimation from '@/../public/lottie/Delivery car logistic.json';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/contexts/AuthContext';
import { useCartContext } from '@/contexts/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, clearCart: clearCartContext } = useCartContext();
  const [processing, setProcessing] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'stripe'
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
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

  // 🧮 Totals (memoized for speed)
  const { subtotal, shippingCost, discount, total } = useMemo(() => {
    const subtotal = cart.reduce(
      (s, item) => s + (Number(item.discountPrice ?? item.price) || 0) * (item.quantity || 1),
      0
    );
    const shippingCost = subtotal > 0 ? 0 : 0;
    const discount = appliedCoupon?.discount_amount || 0;
    const total = Number((subtotal + shippingCost - discount).toFixed(2));
    return { subtotal, shippingCost, discount, total };
  }, [cart, appliedCoupon]);

  // ✅ Validate form
  const validate = () => {
    if (!cart.length) return toast.error('Your cart is empty.');

    const required = ['fullName', 'email', 'phone', 'address', 'city', 'postalCode', 'country'];
    for (const f of required) {
      if (!shipping[f]?.trim()) {
        toast.error(`Please fill ${f}`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;
    const postalRegex = /^[0-9]{4,6}$/;

    if (!emailRegex.test(shipping.email)) return toast.error('Invalid email');
    if (!phoneRegex.test(shipping.phone)) return toast.error('Invalid phone number');
    if (!postalRegex.test(shipping.postalCode)) return toast.error('Invalid postal code');
    return true;
  };

  // 🧹 Clear cart using context
  const clearUserCart = () => {
    clearCartContext(user);
  };

  // ✅ Validate coupon
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          cart_total: subtotal,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAppliedCoupon(data.data);
        toast.success(`Coupon applied! You saved ${data.data.discount_amount}`);
        setCouponCode('');
      } else {
        toast.error(data.message || 'Invalid coupon');
      }
    } catch (error) {
      toast.error('Error validating coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  // 🧾 Place Order
  const handlePlaceOrder = async () => {
    if (!validate()) return;
    
    if (paymentMethod === 'stripe') {
      await handleStripePayment();
    } else {
      await handleCODOrder();
    }
  };

  // 💳 Handle Stripe Payment
  const handleStripePayment = async () => {
    if (!user?.id) {
      toast.error('Please login to use online payment');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create order in our database first (without payment)
      const orderPayload = {
        user_id: user.id,
        shipping,
        items: cart.map((it) => ({
          product_id: it.id,
          name: it.name,
          price: Number(it.discountPrice ?? it.price),
          quantity: Number(it.quantity ?? 1),
        })),
        payment_method: 'stripe',
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: appliedCoupon?.discount_amount || 0,
        total,
      };

      const orderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const orderData = await orderRes.json();
      const orderId = orderData.data.orderId;

      // Step 2: Create Stripe checkout session
      const sessionRes = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          orderId,
          items: cart.map((it) => ({
            product_id: it.id,
            name: it.name,
            price: Number(it.discountPrice ?? it.price),
            quantity: Number(it.quantity ?? 1),
          })),
          shipping,
        }),
      });

      if (!sessionRes.ok) throw new Error('Failed to create checkout session');
      const sessionData = await sessionRes.json();

      // Step 3: Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionData.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Stripe payment error:', err);
      toast.error(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  // 📦 Handle COD Order
  const handleCODOrder = async () => {
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
        coupon_code: appliedCoupon?.code || null,
        coupon_discount: appliedCoupon?.discount_amount || 0,
        total,
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create order');
      const data = await res.json();

      setShowAnimation(true);
      clearUserCart();

      setTimeout(() => router.push('/myorders'), 4000);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  // 🎉 Animation after order
  if (showAnimation) {
    return (
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Lottie animationData={parcelAnimation} loop={false} className="w-96 h-96" />
        <motion.p
          className="text-2xl font-semibold text-gray-700 mt-6"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Order Placed Successfully!
        </motion.p>
        <p className="text-gray-500 mt-2">Redirecting to My Orders...</p>
      </motion.div>
    );
  }

  // 🧱 Checkout UI
  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
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
          {/* Left Section */}
          <motion.div
            className="space-y-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Shipping Details */}
            <section className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
                Shipping Details
              </h2>

              {/** Define required fields with labels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { name: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
                  { name: 'email', label: 'Email', placeholder: 'john@example.com' },
                  { name: 'phone', label: 'Phone Number', placeholder: '9876543210' },
                  { name: 'postalCode', label: 'Postal Code', placeholder: '123456' },
                  { name: 'city', label: 'City', placeholder: 'Mumbai' },
                  { name: 'state', label: 'State', placeholder: 'Maharashtra' },
                  { name: 'country', label: 'Country', placeholder: 'India' },
                ].map((f) => {
                  const error =
                    f.name === 'email' && shipping[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping[f.name])
                      ? 'Invalid email'
                      : f.name === 'phone' && shipping[f.name] && !/^[0-9]{10}$/.test(shipping[f.name])
                      ? 'Invalid phone number'
                      : f.name === 'postalCode' && shipping[f.name] && !/^[0-9]{4,6}$/.test(shipping[f.name])
                      ? 'Invalid postal code'
                      : !shipping[f.name]?.trim()
                      ? 'Required'
                      : '';

                  return (
                    <div key={f.name} className="flex flex-col">
                      <label className="font-medium text-gray-700 mb-1">{f.label}</label>
                      <input
                        placeholder={f.placeholder}
                        value={shipping[f.name]}
                        onChange={(e) =>
                          setShipping({ ...shipping, [f.name]: e.target.value })
                        }
                        className={`p-3 border rounded-lg focus:outline-none transition ${
                          error
                            ? 'border-red-400 focus:ring-2 focus:ring-red-400'
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-400'
                        }`}
                      />
                      {error && (
                        <span className="text-red-500 text-sm mt-1">{error}</span>
                      )}
                    </div>
                  );
                })}

                <div className="flex flex-col col-span-1 md:col-span-2">
                  <label className="font-medium text-gray-700 mb-1">Full Address</label>
                  <textarea
                    placeholder="123 Street Name, Near Park"
                    value={shipping.address}
                    onChange={(e) =>
                      setShipping({ ...shipping, address: e.target.value })
                    }
                    rows="3"
                    className={`p-3 border rounded-lg focus:outline-none transition ${
                      !shipping.address.trim()
                        ? 'border-red-400 focus:ring-2 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-400'
                    }`}
                  />
                  {!shipping.address.trim() && (
                    <span className="text-red-500 text-sm mt-1">Required</span>
                  )}
                </div>
              </div>
            </section>


            {/* Payment Method */}
            <section className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
                Payment Method
              </h3>
              <div className="space-y-4">
                <label 
                  className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition ${
                    paymentMethod === 'cod' 
                      ? 'ring-2 ring-blue-300 bg-blue-50 border-blue-300' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <input 
                    type="radio" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-blue-600" 
                  />
                  <div>
                    <div className="font-medium text-gray-800 text-base">
                      💵 Cash on Delivery (COD)
                    </div>
                    <div className="text-sm text-gray-600">
                      Pay when you receive your order.
                    </div>
                  </div>
                </label>

                <label 
                  className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition ${
                    paymentMethod === 'stripe' 
                      ? 'ring-2 ring-purple-300 bg-purple-50 border-purple-300' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setPaymentMethod('stripe')}
                >
                  <input 
                    type="radio" 
                    checked={paymentMethod === 'stripe'} 
                    onChange={() => setPaymentMethod('stripe')}
                    className="mt-1 accent-purple-600" 
                  />
                  <div>
                    <div className="font-medium text-gray-800 text-base">
                      💳 Card Payment (Stripe)
                    </div>
                    <div className="text-sm text-gray-600">
                      Pay securely with Stripe. Visa, Mastercard, and more. {!user?.id && <span className="text-orange-600 font-medium">(Login required)</span>}
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-5">
              <Button
                onClick={handlePlaceOrder}
                disabled={processing}
                className={`flex-1 py-4 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white 
                transition-transform duration-200 hover:scale-105 cursor-pointer ${
                  processing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {processing ? 'Processing...' : 'Place Order'}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/cart')}
                className="flex-1 py-4 text-lg rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-transform duration-200 hover:scale-105 cursor-pointer"
              >
                Back to Cart
              </Button>
            </div>
          </motion.div>

          {/* Right Section */}
          <aside className="bg-white rounded-2xl shadow-lg p-8 sticky top-8 h-fit">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
              Order Summary
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {(item.imageUrl || item.images?.[0]) ? (
                      <Image
                        src={item.imageUrl || item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} × ₹
                      {Number(item.discountPrice ?? item.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">
                    ₹
                    {(
                      Number(item.discountPrice ?? item.price) * Number(item.quantity)
                    ).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Have a coupon code?
              </label>
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-green-700">
                        ✓ {appliedCoupon.code}
                      </p>
                      <p className="text-sm text-green-600">
                        Discount: ₹{appliedCoupon.discount_amount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleValidateCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              )}
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
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl border-t pt-3 mt-3">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
