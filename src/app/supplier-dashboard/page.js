'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, BarChart2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext'; // ✅ use your global auth

export default function SupplierDashboardPage() {
  const { user, isLoggedIn } = useAuth(); // ✅ Context-aware login
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch supplier dashboard data
  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'supplier') {
      toast.error('Unauthorized access');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/supplier/${user.id}/dashboard`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch supplier dashboard');

        setDashboardData(data);
      } catch (err) {
        console.error('❌ Dashboard fetch error:', err);
        toast.error('Failed to load supplier dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, user]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    );

  if (!isLoggedIn || user?.role !== 'supplier')
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-red-600">
        <p className="text-xl font-semibold">You are not logged in as a supplier.</p>
      </div>
    );

  // ✅ Data fallbacks (so UI doesn’t break)
  const {
    totalProducts = 0,
    ordersReceived = 0,
    revenue = 0,
    completedOrders = 0,
    pendingOrders = 0,
    monthlySales = [],
    topProducts = [],
    recentOrders = [],
  } = dashboardData || {};

  const stats = [
    { title: 'Total Products', value: totalProducts, icon: Package, color: 'bg-blue-100', textColor: 'text-blue-600' },
    { title: 'Orders Received', value: ordersReceived, icon: ShoppingCart, color: 'bg-green-100', textColor: 'text-green-600' },
    { title: 'Total Revenue', value: `$${Number(revenue).toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-100', textColor: 'text-yellow-600' },
    { title: 'Completed Orders', value: completedOrders, icon: BarChart2, color: 'bg-purple-100', textColor: 'text-purple-600' },
    { title: 'Pending Orders', value: pendingOrders, icon: BarChart2, color: 'bg-pink-100', textColor: 'text-pink-600' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Supplier Dashboard</h1>

      {/* === Stats Cards === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <AnimatePresence>
          {stats.map(({ title, value, icon: Icon, color, textColor }) => (
            <motion.div
              key={title}
              className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className={`${color} p-3 rounded-xl`}>
                <Icon className={`${textColor}`} size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-semibold text-gray-800">{value}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* === Charts Section === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Sales */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Sales</h2>
          {monthlySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlySales}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="sales" stroke="#004a7c" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">No sales data available.</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                <Bar dataKey="orders" fill="#004a7c" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">No top products data available.</p>
          )}
        </div>
      </div>

      {/* === Recent Orders Table === */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-sm font-medium text-gray-600">Order ID</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-600">Customer</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-600">Product</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-2 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2 font-medium">#{order.id}</td>
                    <td className="px-4 py-2">{order.customer}</td>
                    <td className="px-4 py-2">{order.product}</td>
                    <td className="px-4 py-2">${order.amount}</td>
                    <td
                      className={`px-4 py-2 font-medium ${
                        order.status === 'delivered'
                          ? 'text-green-600'
                          : order.status === 'pending'
                          ? 'text-yellow-500'
                          : 'text-red-600'
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">No recent orders found.</p>
        )}
      </div>
    </div>
  );
}



// "use client";

// import { useEffect, useState } from "react";
// import { Package, ShoppingCart, DollarSign, BarChart2 } from "lucide-react";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
//   BarChart, Bar
// } from "recharts";

// export default function SupplierDashboardPage() {
//   const [supplierId, setSupplierId] = useState(null);

//   // Default states (for empty DB, UI still shows placeholders)
//   const [stats, setStats] = useState([
//     { title: "Total Products", value: 0, icon: Package, color: "bg-blue-100", textColor: "text-blue-600" },
//     { title: "Orders Received", value: 0, icon: ShoppingCart, color: "bg-green-100", textColor: "text-green-600" },
//     { title: "Total Revenue", value: "$0", icon: DollarSign, color: "bg-yellow-100", textColor: "text-yellow-600" },
//     { title: "Completed Orders", value: 0, icon: BarChart2, color: "bg-purple-100", textColor: "text-purple-600" },
//     { title: "Pending Orders", value: 0, icon: BarChart2, color: "bg-purple-100", textColor: "text-purple-600" },
//   ]);

//   const [monthlySales, setMonthlySales] = useState([
//     { month: "Jan", sales: 5 }, { month: "Feb", sales: 10 }, { month: "Mar", sales: 0 },
//     { month: "Apr", sales: 0 }, { month: "May", sales: 30 }, { month: "Jun", sales: 20 },
//     { month: "Jul", sales: 50 }, { month: "Aug", sales: 80 }, { month: "Sep", sales: 0 },
//     { month: "Oct", sales: 0 }, { month: "Nov", sales: 0 }, { month: "Dec", sales: 100 },
//   ]);

//   const [topProducts, setTopProducts] = useState([
//     { name: "Product A", orders: 10 },
//     { name: "Product B", orders: 20 },
//     { name: "Product C", orders: 5 },
//   ]);

//   const [recentOrders, setRecentOrders] = useState([
//     { id: "1", customer: "-", product: "-", amount: 0, status: "pending" },
//     { id: "2", customer: "-", product: "-", amount: 0, status: "pending" },
//     { id: "3", customer: "-", product: "-", amount: 0, status: "pending" },
//   ]);

//   // Fetch dashboard data from API
//   useEffect(() => {
//     const id = localStorage.getItem("supplierId");
//     if (!id) return;
//     setSupplierId(id);

//     fetch(`/api/supplier/${id}/dashboard`)
//       .then(res => res.json())
//       .then(data => {
//         if (!data) return;

//         setStats([
//           { title: "Total Products", value: data.totalProducts ?? 0, icon: Package, color: "bg-blue-100", textColor: "text-blue-600" },
//           { title: "Orders Received", value: data.ordersReceived ?? 0, icon: ShoppingCart, color: "bg-green-100", textColor: "text-green-600" },
//           { title: "Total Revenue", value: `$${data.revenue ?? 0}`, icon: DollarSign, color: "bg-yellow-100", textColor: "text-yellow-600" },
//           { title: "Completed Orders", value: data.completedOrders ?? 0, icon: BarChart2, color: "bg-purple-100", textColor: "text-purple-600" },
//           { title: "Pending Orders", value: data.pendingOrders ?? 0, icon: BarChart2, color: "bg-purple-100", textColor: "text-purple-600" },
//         ]);

//         setMonthlySales(data.monthlySales ?? monthlySales);
//         setTopProducts(data.topProducts ?? topProducts);
//         setRecentOrders(data.recentOrders ?? recentOrders);
//       })
//       .catch(err => console.error(err));
//   }, []);

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Supplier Dashboard</h1>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {stats.map(({ title, value, icon: Icon, color, textColor }) => (
//           <div key={title} className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
//             <div className={`${color} p-3 rounded-xl`}>
//               <Icon className={`${textColor}`} size={28} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">{title}</p>
//               <p className="text-2xl font-semibold text-gray-800">{value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Monthly Sales Chart */}
//         <div className="bg-white p-6 rounded-2xl shadow">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Sales</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={monthlySales}>
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
//               <Line type="monotone" dataKey="sales" stroke="#004a7c" strokeWidth={3} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Top Products Chart */}
//         <div className="bg-white p-6 rounded-2xl shadow">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={topProducts}>
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
//               <Bar dataKey="orders" fill="#004a7c" radius={[5, 5, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Orders Table */}
//       <div className="bg-white p-6 rounded-2xl shadow">
//         <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-left">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Order ID</th>
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Customer</th>
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Product</th>
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Amount</th>
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recentOrders.map(order => (
//                 <tr key={order.id} className="border-b hover:bg-gray-50 transition">
//                   <td className="px-4 py-2">#{order.id}</td>
//                   <td className="px-4 py-2">{order.customer}</td>
//                   <td className="px-4 py-2">{order.product}</td>
//                   <td className="px-4 py-2">${order.amount}</td>
//                   <td className={`px-4 py-2 font-medium ${
//                     order.status === 'delivered' ? 'text-green-600' :
//                     order.status === 'pending' ? 'text-yellow-500' :
//                     'text-red-600'
//                   }`}>
//                     {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useEffect, useState } from "react";
// import { Package, ShoppingCart, DollarSign, BarChart2 } from "lucide-react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   BarChart,
//   Bar
// } from "recharts";

// export default function SupplierDashboardPage() {
//   const [supplierId, setSupplierId] = useState(null);
//   const [stats, setStats] = useState([]);
//   const [monthlySales, setMonthlySales] = useState([]);
//   const [topProducts, setTopProducts] = useState([]);
//   const [recentOrders, setRecentOrders] = useState([]);

//   // ✅ Fetch dashboard data
//   useEffect(() => {
//   const id = localStorage.getItem("supplierId");
//   if (!id) return;

//   fetch(`/api/supplier/${id}/dashboard`)
//     .then(res => res.json())
//     .then(data => {
//       if (!data) return;

//       setStats([
//         { title: "Total Products", value: data.totalProducts ?? 0, icon: Package, color: "bg-blue-100", textColor: "text-blue-600" },
//         { title: "Orders Received", value: data.ordersReceived ?? 0, icon: ShoppingCart, color: "bg-green-100", textColor: "text-green-600" },
//         { title: "Total Revenue", value: `$${data.revenue ?? 0}`, icon: DollarSign, color: "bg-yellow-100", textColor: "text-yellow-600" },
//         { title: "Completed Orders", value: data.completedOrders ?? 0, icon: BarChart2, color: "bg-purple-100", textColor: "text-purple-600" },
//         { title: "Pending Orders", value: data.pendingOrders ?? 0, icon: BarChart2, color: "bg-purple-100", textColor: "text-purple-600" },
//       ]);

//       setMonthlySales(data.monthlySales ?? monthlySales);
//       setTopProducts(data.topProducts ?? topProducts);
//       setRecentOrders(data.recentOrders ?? recentOrders);
//     })
//     .catch(err => console.error(err));
// }, []);

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Supplier Dashboard</h1>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {stats.map(({ title, value, icon: Icon, color, textColor }) => (
//           <div key={title} className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
//             <div className={`${color} p-3 rounded-xl`}>
//               <Icon className={`${textColor}`} size={28} />
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">{title}</p>
//               <p className="text-2xl font-semibold text-gray-800">{value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Monthly Sales Chart */}
//         <div className="bg-white p-6 rounded-2xl shadow">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Sales</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={monthlySales}>
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
//               <Line type="monotone" dataKey="sales" stroke="#004a7c" strokeWidth={3} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Top Products Chart */}
//         <div className="bg-white p-6 rounded-2xl shadow">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={topProducts}>
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
//               <Bar dataKey="orders" fill="#004a7c" radius={[5, 5, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Orders Table */}
//       <div className="bg-white p-6 rounded-2xl shadow">
//         <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
//         <div className="overflow-x-auto">
//           <table className="min-w-full text-left">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Order ID</th>
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Customer</th>
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Product</th>
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Amount</th>
//                 <th className="px-4 py-2 text-sm font-medium text-gray-600">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recentOrders.map(order => (
//                 <tr key={order.id} className="border-b hover:bg-gray-50 transition">
//                   <td className="px-4 py-2">#{order.id}</td>
//                   <td className="px-4 py-2">{order.customer}</td>
//                   <td className="px-4 py-2">{order.product}</td>
//                   <td className="px-4 py-2">${order.amount}</td>
//                   <td className={`px-4 py-2 font-medium ${
//                     order.status === 'delivered' ? 'text-green-600' :
//                     order.status === 'pending' ? 'text-yellow-500' :
//                     'text-red-600'
//                   }`}>
//                     {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }



// // 'use client';

// // import { Package, ShoppingCart, DollarSign, BarChart2 } from 'lucide-react';

// // export default function SupplierDashboardPage() {
// //   const stats = [
// //     { title: 'Total Products', value: 128, icon: Package },
// //     { title: 'Orders Received', value: 52, icon: ShoppingCart },
// //     { title: 'Total Revenue', value: '$12,400', icon: DollarSign },
// //     { title: 'Performance', value: '+12.4%', icon: BarChart2 },
// //   ];

// //   return (
// //     <div>
// //       <h1 className="text-3xl font-bold text-[#004a7c] mb-6">Dashboard Overview</h1>

// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// //         {stats.map(({ title, value, icon: Icon }) => (
// //           <div
// //             key={title}
// //             className="bg-white shadow-md rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition"
// //           >
// //             <div className="bg-[#004a7c]/10 p-3 rounded-xl">
// //               <Icon className="text-[#004a7c]" size={28} />
// //             </div>
// //             <div>
// //               <h3 className="text-sm text-gray-600">{title}</h3>
// //               <p className="text-2xl font-semibold text-[#004a7c]">{value}</p>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }
