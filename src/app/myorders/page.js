'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, PackageX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const user_id = 1; // Replace with actual logged-in user ID

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(`/api/myorders?user_id=${user_id}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
          setFilteredOrders(data.orders);
        }
      } catch (err) {
        console.error('❌ Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleFilterChange = (status) => {
    setFilter(status);
    if (status === 'all') setFilteredOrders(orders);
    else setFilteredOrders(orders.filter((o) => o.status.toLowerCase() === status));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-gray-500" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Filter by:</label>
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Show Empty State or Orders */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center text-gray-600 bg-white border rounded-xl py-12 shadow-sm"
        >
          <PackageX className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-lg font-semibold mb-1">No orders found</p>
          <p className="text-sm text-gray-500 mb-3">
            Try changing your filter or place a new order!
          </p>
          <button
            onClick={() => handleFilterChange('all')}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Reset Filter
          </button>
        </motion.div>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order.order_id}
            className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gray-50 border-b px-5 py-3 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-gray-800">Order #{order.order_id}</h2>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : order.status === 'shipped'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Shipping Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Shipping Details
                  </h3>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>
                      <strong>Name:</strong> {order.recipient_name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.phone}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.shipping_address}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Payment Summary
                  </h3>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>
                      <strong>Mode:</strong> {order.payment_mode}
                    </p>
                    <p>
                      <strong>Status:</strong> {order.payment_status}
                    </p>
                    <p>
                      <strong>Total:</strong> ₹{order.total_amount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Items</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center gap-3 border rounded-lg p-2 hover:bg-gray-50 transition"
                    >
                      <Image
                        src={
                          typeof item.product_image === 'string' &&
                          item.product_image.trim() !== ''
                            ? item.product_image
                            : '/images/products/placeholder.svg'
                        }
                        alt={item.product_name || 'Product image'}
                        width={60}
                        height={60}
                        className="rounded-md"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Progress Bar */}
              <div className="border-t pt-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Order Status
                </h3>

                {['cancelled', 'returned'].includes(order.status.toLowerCase()) ? (
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`px-3 py-1 rounded-full font-medium ${
                        order.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.status === 'cancelled'
                        ? '❌ Order Cancelled'
                        : '🔁 Returned'}
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full">
                    <div className="absolute top-2 left-0 w-full h-1 bg-gray-200 rounded-full" />
                    {[
                      'Confirmed',
                      'Packed',
                      'Shipped',
                      'Out for Delivery',
                      'Delivered',
                    ].map((step, index) => {
                      const currentStepIndex = [
                        'confirmed',
                        'packed',
                        'shipped',
                        'out_for_delivery',
                        'delivered',
                      ].indexOf(order.status.toLowerCase());

                      const isCompleted = index <= currentStepIndex;
                      const isActive = index === currentStepIndex;

                      return (
                        <div
                          key={step}
                          className="relative z-10 flex flex-col items-center"
                          style={{
                            width: '20%',
                            display: 'inline-block',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              isCompleted
                                ? 'bg-green-500 border-green-500'
                                : isActive
                                ? 'border-blue-500 bg-blue-500'
                                : 'bg-white border-gray-300'
                            }`}
                          />
                          <span
                            className={`text-xs mt-2 ${
                              isCompleted
                                ? 'text-green-700 font-medium'
                                : 'text-gray-500'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

