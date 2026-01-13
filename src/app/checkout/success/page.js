'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Lottie from 'lottie-react';
import parcelAnimation from '@/../public/lottie/Delivery car logistic.json';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/button';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !orderId) {
        setStatus('failed');
        toast.error('Missing payment information');
        return;
      }

      try {
        console.log('🔍 Verifying payment with sessionId:', sessionId, 'orderId:', orderId);

        const res = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sessionId, orderId }),
        });

        const data = await res.json();
        console.log('✅ Verification response:', data);

        if (data.success) {
          setOrderData(data.data);
          setStatus('success');
          toast.success('Payment successful! Your order is confirmed.');

          // Redirect to orders page after 4 seconds
          setTimeout(() => {
            router.push('/myorders');
          }, 4000);
        } else {
          console.error('❌ Verification failed:', data.message);
          setStatus('failed');
          toast.error(data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('❌ Verification error:', err);
        setStatus('failed');
        toast.error('Payment verification error: ' + err.message);
      }
    };

    verifyPayment();
  }, [sessionId, orderId, router]);

  // Verifying state
  if (status === 'verifying') {
    return (
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Loader2 className="animate-spin w-16 h-16 text-blue-600 mb-4" />
        <p className="text-xl font-semibold text-gray-700">Verifying your payment...</p>
        <p className="text-gray-500 mt-2">Please wait while we confirm your transaction.</p>
      </motion.div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Lottie animationData={parcelAnimation} loop={false} className="w-96 h-96" />
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <p className="text-2xl font-bold text-green-600">Payment Successful!</p>
          </div>
          <p className="text-gray-700 mt-2">
            Order #{orderData?.order?.id} has been confirmed.
          </p>
          <p className="text-gray-500 mt-2">Redirecting to your orders...</p>
        </motion.div>
      </motion.div>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <motion.div
        className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <XCircle className="w-16 h-16 text-red-600 mb-4" />
        <p className="text-2xl font-bold text-red-600 mb-2">Payment Failed</p>
        <p className="text-gray-600 text-center mb-8 max-w-md">
          We couldn't verify your payment. Please try again or contact support.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/checkout')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Retry Payment
          </Button>
          <Button
            onClick={() => router.push('/myorders')}
            variant="outline"
            className="border-2 border-gray-300 px-6 py-3 rounded-lg"
          >
            View Orders
          </Button>
        </div>
      </motion.div>
    );
  }
}
