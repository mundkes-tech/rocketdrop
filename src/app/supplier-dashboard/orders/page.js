'use client';

import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierId, setSupplierId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('supplierId');
    setSupplierId(id);
    if (id) fetchOrders(id);
  }, []);

  const fetchOrders = async (id) => {
    try {
      const res = await fetch(`/api/supplier/${id}/orders`);
      const data = await res.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Filter logic
  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (order) =>
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [statusFilter, searchTerm, orders]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders</h1>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by customer or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-xl focus:ring-2 focus:ring-[#004a7c] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-gray-500" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#004a7c] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-6 rounded-2xl shadow overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-700">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium">#{order.id}</td>
                  <td className="px-4 py-2">{order.customer}</td>
                  <td className="px-4 py-2">{order.product}</td>
                  <td className="px-4 py-2">{order.quantity}</td>
                  <td className="px-4 py-2">${order.amount}</td>
                  <td className="px-4 py-2 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td
                    className={`px-4 py-2 font-medium ${
                      order.status === 'delivered'
                        ? 'text-green-600'
                        : order.status === 'pending'
                        ? 'text-yellow-500'
                        : order.status === 'processing'
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-6">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
