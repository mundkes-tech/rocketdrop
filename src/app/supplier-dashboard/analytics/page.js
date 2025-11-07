'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Package, ShoppingCart, DollarSign, CheckCircle, Clock, Download } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Improved Supplier Analytics Page
 * - Tailwind + Framer Motion for subtle animations
 * - Debounced / cancellable fetches
 * - Reusable small components (KPI card, Card wrapper, Skeleton)
 * - Memoized chart inputs for performance
 * - CSV + PDF export (pdf uses dynamic import like before)
 *
 * Note: Keep same API shape as original page.
 */

const COLORS = ['#004a7c', '#00BFFF', '#FFA500', '#FF6347', '#7B68EE', '#2ecc71', '#e74c3c'];

function Spinner() {
  return <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin border-gray-300" />;
}

function Skeleton({ className = '' }) {
  return <div className={`bg-gray-200/60 animate-pulse rounded ${className}`} aria-hidden="true" />;
}

function KPI({ title, value, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="bg-white p-5 rounded-2xl shadow flex items-center justify-between"
      role="status"
      aria-live="polite"
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-gray-100">
        <Icon size={28} className="text-gray-600" />
      </div>
    </motion.div>
  );
}

function Card({ children, className = '' }) {
  return <div className={`bg-white p-6 rounded-2xl shadow ${className}`}>{children}</div>;
}

export default function SupplierAnalyticsPage() {
  const [supplierId, setSupplierId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // filters
  const [rangeKind, setRangeKind] = useState('6m');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  // UI lists
  const [categories, setCategories] = useState([]);
  const [productsList, setProductsList] = useState([]);

  // debounce/abort refs
  const fetchTimer = useRef(null);
  const abortCtrl = useRef(null);

  // load supplier id + initial lists
  useEffect(() => {
    const id = localStorage.getItem('supplier_id') || localStorage.getItem('supplierId') || localStorage.getItem('supplierid');
    if (id) {
      setSupplierId(id);
      // initial fetches
      fetchCategories();
      fetchProductsList(id);
      fetchDashboardDebounced(id, { immediate: true });
    } else {
      setLoading(false);
      console.warn('No supplier_id found in localStorage');
    }
    return () => {
      if (fetchTimer.current) clearTimeout(fetchTimer.current);
      if (abortCtrl.current) abortCtrl.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper: build query string
  const buildQuery = useCallback((opts = {}) => {
    const params = new URLSearchParams();
    const range = opts.range ?? rangeKind;
    if (range && range !== 'custom') params.append('range', range);
    if (range === 'custom' && opts.from && opts.to) {
      params.append('from', opts.from);
      params.append('to', opts.to);
    } else if (range === 'custom' && customFrom && customTo) {
      params.append('from', customFrom);
      params.append('to', customTo);
    }
    const cat = opts.category ?? categoryFilter;
    if (cat && cat !== 'all') params.append('category_id', cat);
    const prod = opts.product ?? productFilter;
    if (prod && prod !== 'all') params.append('product_id', prod);
    return params.toString();
  }, [rangeKind, customFrom, customTo, categoryFilter, productFilter]);

  // debounced fetch
  const fetchDashboardDebounced = useCallback((id, opts = {}) => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    // cancel previous inflight request
    if (abortCtrl.current) {
      try { abortCtrl.current.abort(); } catch (e) {}
    }

    const delay = opts.immediate ? 0 : 450; // short debounce for filter changes
    fetchTimer.current = setTimeout(() => {
      fetchDashboard(id, opts);
    }, delay);
  }, []);

  // actual fetch with AbortController
  async function fetchDashboard(id, opts = {}) {
    setLoading(true);
    abortCtrl.current = new AbortController();
    try {
      const qs = buildQuery(opts);
      const url = `/api/supplier/${id}/dashboard${qs ? `?${qs}` : ''}`;
      const res = await fetch(url, { signal: abortCtrl.current.signal });
      if (!res.ok) throw new Error(`Failed to load dashboard (${res.status})`);
      const json = await res.json();

      // normalize numeric fields defensively
      const normalize = (arr, key) => (arr || []).map(r => ({ ...r, [key]: Number(r[key]) || 0 }));
      const normalized = {
        totalProducts: Number(json.totalProducts) || 0,
        ordersReceived: Number(json.ordersReceived) || 0,
        revenue: Number(json.revenue) || 0,
        completedOrders: Number(json.completedOrders) || 0,
        pendingOrders: Number(json.pendingOrders) || 0,
        monthlySales: normalize(json.monthlySales, 'sales'),
        topProducts: (json.topProducts || []).map(p => ({ ...p, orders: Number(p.orders) || 0, revenue: Number(p.revenue) || 0 })),
        categoryRevenue: (json.categoryRevenue || []).map(c => ({ ...c, revenue: Number(c.revenue) || 0 })),
        inventoryStats: json.inventoryStats || { lowStock: 0, outOfStock: 0, inventoryValue: 0 },
        ordersByRegion: (json.ordersByRegion || []).map(r => ({ ...r, orders: Number(r.orders) || 0 })),
      };

      setData(normalized);
    } catch (err) {
      if (err.name === 'AbortError') {
        // aborted intentionally
        return;
      }
      console.error('Error fetching dashboard data:', err);
      setData({
        totalProducts: 0, ordersReceived: 0, revenue: 0,
        completedOrders: 0, pendingOrders: 0,
        monthlySales: [], topProducts: [], categoryRevenue: [],
        inventoryStats: { lowStock: 0, outOfStock: 0, inventoryValue: 0 }, ordersByRegion: []
      });
    } finally {
      setLoading(false);
    }
  }

  // fetch categories & products list (simple, no debounce)
  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Categories load failed');
      const json = await res.json();
      setCategories(json || []);
    } catch (err) {
      console.warn('Could not fetch categories:', err);
      setCategories([]);
    }
  }
  async function fetchProductsList(id) {
    try {
      const res = await fetch(`/api/supplier/products?supplier_id=${id}`);
      if (!res.ok) throw new Error('Products list load failed');
      const json = await res.json();
      setProductsList(json || []);
    } catch (err) {
      console.warn('Could not fetch products list:', err);
      setProductsList([]);
    }
  }

  // refetch when filters change (debounced)
  useEffect(() => {
    if (!supplierId) return;
    fetchDashboardDebounced(supplierId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKind, customFrom, customTo, categoryFilter, productFilter, supplierId]);

  // derived & memoized values for UI + charts
  const totalProducts = data?.totalProducts ?? 0;
  const ordersReceived = data?.ordersReceived ?? 0;
  const totalRevenue = data?.revenue ?? 0;
  const completedOrders = data?.completedOrders ?? 0;
  const pendingOrders = data?.pendingOrders ?? 0;
  const monthlySales = useMemo(() => (data?.monthlySales ?? []).map(row => ({ ...row })), [data?.monthlySales]);
  const topProducts = data?.topProducts ?? [];
  const categoryRevenue = useMemo(() => (data?.categoryRevenue ?? []).map(c => ({ ...c })), [data?.categoryRevenue]);
  const inventoryStats = data?.inventoryStats ?? { lowStock: 0, outOfStock: 0, inventoryValue: 0 };
  const ordersByRegion = useMemo(() => (data?.ordersByRegion ?? []).map(r => ({ ...r })), [data?.ordersByRegion]);

  const avgOrderValue = useMemo(() => (ordersReceived ? (totalRevenue / ordersReceived).toFixed(2) : '0.00'), [ordersReceived, totalRevenue]);
  const completedPct = useMemo(() => (ordersReceived ? Math.round((completedOrders / ordersReceived) * 100) : 0), [ordersReceived, completedOrders]);

  // export CSV
  const exportCSV = useCallback(() => {
    const rows = [];
    rows.push(['Supplier Analytics Export']);
    rows.push([]);
    rows.push(['KPI', 'Value']);
    rows.push(['Total Products', totalProducts]);
    rows.push(['Orders Received', ordersReceived]);
    rows.push(['Total Revenue', totalRevenue]);
    rows.push(['Completed Orders', completedOrders]);
    rows.push(['Pending Orders', pendingOrders]);
    rows.push([]);
    rows.push(['Monthly Sales']);
    rows.push(['Month', 'Sales']);
    monthlySales.forEach(r => rows.push([r.month, r.sales]));
    rows.push([]);
    rows.push(['Top Products']);
    rows.push(['Product', 'Orders', 'Revenue']);
    topProducts.forEach(p => rows.push([p.name, p.orders, p.revenue ?? '']));
    rows.push([]);
    rows.push(['Category Revenue']);
    rows.push(['Category', 'Revenue']);
    categoryRevenue.forEach(c => rows.push([c.category, c.revenue]));
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplier-analytics-${supplierId || 'unknown'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [totalProducts, ordersReceived, totalRevenue, completedOrders, pendingOrders, monthlySales, topProducts, categoryRevenue, supplierId]);

  // export PDF (dynamic import)
  const exportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const el = document.getElementById('analytics-export-area');
      if (!el) return alert('Nothing to export.');
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`supplier-analytics-${supplierId || 'unknown'}.pdf`);
    } catch (err) {
      console.error('Export PDF failed:', err);
      alert('Export to PDF failed. Make sure jsPDF and html2canvas are available.');
    }
  }, [supplierId]);

  // small helper to apply selected class for active filter
  const isCustomRange = rangeKind === 'custom';

  // Render
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#004a7c]">Supplier Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Insights to manage inventory, pricing and growth.</p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="bg-white p-2 rounded-xl shadow">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100"
              title="Export CSV"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>
          <div className="bg-white p-2 rounded-xl shadow">
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100"
              title="Export PDF"
            >
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 mr-2">Date Range:</label>
          <select value={rangeKind} onChange={(e) => setRangeKind(e.target.value)} className="border rounded-md px-3 py-2">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {isCustomRange && (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="border px-3 py-2 rounded-md" />
            <span className="text-gray-500">to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="border px-3 py-2 rounded-md" />
            <button
              onClick={() => fetchDashboardDebounced(supplierId, { range: 'custom', from: customFrom, to: customTo })}
              className="ml-2 px-3 py-2 bg-[#004a7c] text-white rounded-md"
            >
              Apply
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-600 mr-2">Category:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border px-3 py-2 rounded-md">
            <option value="all">All</option>
            {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 mr-2">Product:</label>
          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="border px-3 py-2 rounded-md">
            <option value="all">All</option>
            {productsList.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Exportable area */}
      <div id="analytics-export-area" className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {loading ? (
            <>
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
            </>
          ) : (
            <>
              <KPI title="Total Products" value={totalProducts} icon={Package} />
              <KPI title="Orders Received" value={ordersReceived} icon={ShoppingCart} />
              <KPI title="Total Revenue" value={`$${Number(totalRevenue).toLocaleString()}`} icon={DollarSign} />
              <KPI title="Completed Orders" value={completedOrders} icon={CheckCircle} />
              <KPI title="Pending Orders" value={pendingOrders} icon={Clock} />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Monthly Sales</h3>
              {loading && <Spinner />}
            </div>
            <div style={{ height: 300 }}>
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#004a7c" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Order Status</h3>
            </div>
            <div style={{ height: 300 }}>
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: completedOrders },
                        { name: 'Pending', value: pendingOrders },
                        { name: 'Other', value: Math.max(0, ordersReceived - completedOrders - pendingOrders) },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {[0, 1, 2].map((i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Category Revenue + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-3">Category Revenue</h3>
            <div style={{ height: 250 }}>
              {loading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#005691" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Top Selling Products</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-100 text-sm text-gray-700">
                  <tr>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Orders</th>
                    <th className="px-4 py-2">Revenue</th>
                    <th className="px-4 py-2">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-6"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-4 py-6"><Skeleton className="h-4 w-10" /></td>
                        <td className="px-4 py-6"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-6"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  ) : (
                    (topProducts.length ? topProducts : [{ name: 'No data', orders: 0, revenue: 0 }]).map((p, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3">{p.orders}</td>
                        <td className="px-4 py-3">${(p.revenue || 0).toFixed(2)}</td>
                        <td className="px-4 py-3">${p.orders ? ((p.revenue || 0) / p.orders).toFixed(2) : '0.00'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Inventory + Region */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-3">Inventory Health</h3>
            {loading ? (
              <Skeleton className="h-32" />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Low stock</p>
                  <p className="font-semibold">{inventoryStats.lowStock}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Out of stock</p>
                  <p className="font-semibold">{inventoryStats.outOfStock}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Inventory value</p>
                  <p className="font-semibold">${(inventoryStats.inventoryValue || 0).toFixed(2)}</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Orders by Region</h3>
            <div style={{ height: 220 }}>
              {loading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersByRegion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#2ecc71" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <Card>
            <p className="text-sm text-gray-500">Avg Order Value</p>
            <p className="text-2xl font-bold mt-1">${avgOrderValue}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Completed Orders %</p>
            <p className="text-2xl font-bold mt-1">{completedPct}%</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Return Rate</p>
            <p className="text-2xl font-bold mt-1">—</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import {
//   LineChart, Line,
//   BarChart, Bar,
//   PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
// } from 'recharts';
// import { Package, ShoppingCart, DollarSign, CheckCircle, Clock, Download } from 'lucide-react';

// /**
//  * Supplier Analytics Page
//  *
//  * - Fetches /api/supplier/{id}/dashboard
//  * - Offers Date Range & Category filter
//  * - Shows KPI cards, monthly sales line chart, category/product bar charts,
//  *   order status pie, top products table, inventory health, and export options.
//  *
//  * Notes:
//  * - Expects supplier_id in localStorage under 'supplier_id'
//  * - Expects backend to return:
//  *   { totalProducts, ordersReceived, revenue, completedOrders, pendingOrders,
//  *     monthlySales: [{month, sales}], topProducts: [{name, orders, revenue}],
//  *     categoryRevenue: [{category, revenue}], inventoryStats: {lowStock, outOfStock, inventoryValue}, ordersByRegion: [{region, orders}] }
//  * - If some fields are missing, falls back to computed / default values.
//  */

// const COLORS = ['#004a7c', '#00BFFF', '#FFA500', '#FF6347', '#7B68EE', '#2ecc71', '#e74c3c'];

// export default function SupplierAnalyticsPage() {
//   const [supplierId, setSupplierId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState(null);

//   // Filters
//   const [rangeKind, setRangeKind] = useState('6m'); // '7d' | '30d' | '6m' | '12m' | 'custom'
//   const [customFrom, setCustomFrom] = useState('');
//   const [customTo, setCustomTo] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [productFilter, setProductFilter] = useState('all');

//   // UI state
//   const [categories, setCategories] = useState([]);
//   const [productsList, setProductsList] = useState([]);

//   // Load supplier id and initial data
//   useEffect(() => {
//     const id = localStorage.getItem('supplier_id') || localStorage.getItem('supplierId') || localStorage.getItem('supplierid');
//     if (id) {
//       setSupplierId(id);
//       fetchAllData(id);
//       fetchCategories();
//       fetchProductsList(id);
//     } else {
//       setLoading(false);
//       console.warn('No supplier_id found in localStorage');
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Fetch dashboard data with optional query params (range/category/product)
//   async function fetchAllData(id) {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       if (rangeKind && rangeKind !== 'custom') params.append('range', rangeKind);
//       if (rangeKind === 'custom' && customFrom && customTo) {
//         params.append('from', customFrom);
//         params.append('to', customTo);
//       }
//       if (categoryFilter && categoryFilter !== 'all') params.append('category_id', categoryFilter);
//       if (productFilter && productFilter !== 'all') params.append('product_id', productFilter);

//       const res = await fetch(`/api/supplier/${id}/dashboard?${params.toString()}`);
//       const json = await res.json();
//       // Normalize numeric values (sometimes DB returns strings)
//       const normalize = (arr, key) => (arr || []).map(r => ({ ...r, [key]: Number(r[key]) || 0 }));
//       const normalized = {
//         totalProducts: Number(json.totalProducts) || 0,
//         ordersReceived: Number(json.ordersReceived) || 0,
//         revenue: Number(json.revenue) || 0,
//         completedOrders: Number(json.completedOrders) || 0,
//         pendingOrders: Number(json.pendingOrders) || 0,
//         monthlySales: normalize(json.monthlySales, 'sales'),
//         topProducts: (json.topProducts || []).map(p => ({ ...p, orders: Number(p.orders) || 0, revenue: Number(p.revenue) || 0 })),
//         categoryRevenue: (json.categoryRevenue || []).map(c => ({ ...c, revenue: Number(c.revenue) || 0 })),
//         inventoryStats: json.inventoryStats || { lowStock: 0, outOfStock: 0, inventoryValue: 0 },
//         ordersByRegion: (json.ordersByRegion || []).map(r => ({ ...r, orders: Number(r.orders) || 0 })),
//       };
//       setData(normalized);
//     } catch (err) {
//       console.error('Error fetching dashboard data:', err);
//       // fallback to empty structure so UI doesn't break
//       setData({
//         totalProducts: 0, ordersReceived: 0, revenue: 0, completedOrders: 0, pendingOrders: 0,
//         monthlySales: [], topProducts: [], categoryRevenue: [], inventoryStats: { lowStock: 0, outOfStock: 0, inventoryValue: 0 }, ordersByRegion: []
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function fetchCategories() {
//     try {
//       const res = await fetch('/api/categories');
//       const json = await res.json();
//       setCategories(json || []);
//     } catch (err) {
//       console.warn('Could not fetch categories:', err);
//     }
//   }

//   async function fetchProductsList(id) {
//     try {
//       const res = await fetch(`/api/supplier/products?supplier_id=${id}`);
//       const json = await res.json();
//       setProductsList(json || []);
//     } catch (err) {
//       console.warn('Could not fetch products list:', err);
//     }
//   }

//   // Re-fetch when filters change
//   useEffect(() => {
//     if (!supplierId) return;
//     fetchAllData(supplierId);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [rangeKind, customFrom, customTo, categoryFilter, productFilter]);

//   // Derived data for charts (with safe fallbacks)
//   const totalProducts = data?.totalProducts ?? 0;
//   const ordersReceived = data?.ordersReceived ?? 0;
//   const totalRevenue = data?.revenue ?? 0;
//   const completedOrders = data?.completedOrders ?? 0;
//   const pendingOrders = data?.pendingOrders ?? 0;
//   const monthlySales = data?.monthlySales ?? [];
//   const topProducts = data?.topProducts ?? [];
//   const categoryRevenue = data?.categoryRevenue ?? [];
//   const inventoryStats = data?.inventoryStats ?? { lowStock: 0, outOfStock: 0, inventoryValue: 0 };
//   const ordersByRegion = data?.ordersByRegion ?? [];

//   // Small helpers:
//   const avgOrderValue = ordersReceived ? (totalRevenue / ordersReceived).toFixed(2) : 0;
//   const completedPct = ordersReceived ? Math.round((completedOrders / ordersReceived) * 100) : 0;
//   const returnRate = 0; // if you have returned orders stat, compute here

//   // Export CSV helper
//   function exportCSV() {
//     // Combine main tables into a single CSV package (monthly sales + topProducts + categoryRevenue)
//     const rows = [];
//     rows.push(['Supplier Analytics Export']);
//     rows.push([]);
//     rows.push(['KPI', 'Value']);
//     rows.push(['Total Products', totalProducts]);
//     rows.push(['Orders Received', ordersReceived]);
//     rows.push(['Total Revenue', totalRevenue]);
//     rows.push(['Completed Orders', completedOrders]);
//     rows.push(['Pending Orders', pendingOrders]);
//     rows.push([]);
//     rows.push(['Monthly Sales']);
//     rows.push(['Month', 'Sales']);
//     monthlySales.forEach(r => rows.push([r.month, r.sales]));
//     rows.push([]);
//     rows.push(['Top Products']);
//     rows.push(['Product', 'Orders', 'Revenue']);
//     topProducts.forEach(p => rows.push([p.name, p.orders, p.revenue ?? '']));
//     rows.push([]);
//     rows.push(['Category Revenue']);
//     rows.push(['Category', 'Revenue']);
//     categoryRevenue.forEach(c => rows.push([c.category, c.revenue]));
//     // Convert to CSV string
//     const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `supplier-analytics-${supplierId || 'unknown'}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   // Export PDF helper (captures the analytics container)
//   async function exportPDF() {
//     try {
//       // dynamic import to avoid SSR issues
//       const html2canvas = (await import('html2canvas')).default;
//       const { jsPDF } = await import('jspdf');

//       const el = document.getElementById('analytics-export-area');
//       if (!el) return alert('Nothing to export.');

//       const canvas = await html2canvas(el, { scale: 2 });
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('landscape', 'pt', 'a4');

//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = pdf.internal.pageSize.getHeight();
//       // Keep aspect ratio
//       const imgWidth = canvas.width;
//       const imgHeight = canvas.height;
//       const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

//       pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
//       pdf.save(`supplier-analytics-${supplierId || 'unknown'}.pdf`);
//     } catch (err) {
//       console.error('Export PDF failed:', err);
//       alert('Export to PDF failed. Make sure jsPDF and html2canvas are installed.');
//     }
//   }

//   if (loading) return <div className="text-center p-10 text-gray-600">Loading analytics...</div>;

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       <div className="flex items-start justify-between gap-6 mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-[#004a7c]">Supplier Analytics</h1>
//           <p className="text-sm text-gray-500 mt-1">Deep insights to help you plan inventory, pricing and growth.</p>
//         </div>

//         <div className="flex gap-3 items-center">
//           <div className="bg-white p-2 rounded-xl shadow">
//             <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100">
//               <Download size={16} /> Export CSV
//             </button>
//           </div>
//           <div className="bg-white p-2 rounded-xl shadow">
//             <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100">
//               <Download size={16} /> Export PDF
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="bg-white p-4 rounded-2xl shadow mb-6 flex flex-col md:flex-row gap-4 items-center">
//         <div className="flex items-center gap-2">
//           <label className="text-sm text-gray-600 mr-2">Date Range:</label>
//           <select value={rangeKind} onChange={(e) => setRangeKind(e.target.value)} className="border rounded-md px-3 py-2">
//             <option value="7d">Last 7 days</option>
//             <option value="30d">Last 30 days</option>
//             <option value="6m">Last 6 months</option>
//             <option value="12m">Last 12 months</option>
//             <option value="custom">Custom</option>
//           </select>
//         </div>

//         {rangeKind === 'custom' && (
//           <div className="flex items-center gap-2">
//             <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="border px-3 py-2 rounded-md" />
//             <span className="text-gray-500">to</span>
//             <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="border px-3 py-2 rounded-md" />
//             <button onClick={() => fetchAllData(supplierId)} className="ml-2 px-3 py-2 bg-[#004a7c] text-white rounded-md">Apply</button>
//           </div>
//         )}

//         <div className="flex items-center gap-2 ml-auto">
//           <label className="text-sm text-gray-600 mr-2">Category:</label>
//           <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border px-3 py-2 rounded-md">
//             <option value="all">All</option>
//             {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
//           </select>
//         </div>

//         <div className="flex items-center gap-2">
//           <label className="text-sm text-gray-600 mr-2">Product:</label>
//           <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className="border px-3 py-2 rounded-md">
//             <option value="all">All</option>
//             {productsList.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
//           </select>
//         </div>
//       </div>

//       {/* Exportable area */}
//       <div id="analytics-export-area" className="space-y-6">
//         {/* KPI Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-4">
//           {[
//             { title: 'Total Products', value: totalProducts, icon: Package },
//             { title: 'Orders Received', value: ordersReceived, icon: ShoppingCart },
//             { title: 'Total Revenue', value: `$${Number(totalRevenue).toLocaleString()}`, icon: DollarSign },
//             { title: 'Completed Orders', value: completedOrders, icon: CheckCircle },
//             { title: 'Pending Orders', value: pendingOrders, icon: Clock },
//           ].map((c, i) => (
//             <div key={i} className="bg-white p-5 rounded-2xl shadow flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">{c.title}</p>
//                 <p className="text-2xl font-bold text-gray-800 mt-1">{c.value}</p>
//                 {i === 2 && <p className="text-xs text-gray-500 mt-1">Avg order: ${avgOrderValue}</p>}
//               </div>
//               <div className="p-3 rounded-full bg-gray-100">
//                 <c.icon size={28} />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Charts grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Monthly Sales (span 2 columns on large) */}
//           <div className="bg-white p-6 rounded-2xl shadow lg:col-span-2">
//             <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={monthlySales}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="sales" stroke="#004a7c" strokeWidth={3} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Orders Status Pie */}
//           <div className="bg-white p-6 rounded-2xl shadow">
//             <h3 className="text-lg font-semibold mb-4">Order Status</h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={[
//                     { name: 'Completed', value: completedOrders },
//                     { name: 'Pending', value: pendingOrders },
//                     { name: 'Other', value: Math.max(0, ordersReceived - completedOrders - pendingOrders) },
//                   ]}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={90}
//                   label
//                 >
//                   {[0, 1, 2].map((i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Category revenue + Top products */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="bg-white p-6 rounded-2xl shadow">
//             <h3 className="text-lg font-semibold mb-4">Category Revenue</h3>
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={categoryRevenue}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="category" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="revenue" fill="#005691" radius={[6,6,0,0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="bg-white p-6 rounded-2xl shadow lg:col-span-2">
//             <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-left">
//                 <thead className="bg-gray-100 text-sm text-gray-700">
//                   <tr>
//                     <th className="px-4 py-2">Product</th>
//                     <th className="px-4 py-2">Orders</th>
//                     <th className="px-4 py-2">Revenue</th>
//                     <th className="px-4 py-2">Avg Price</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {topProducts.length ? topProducts.map((p, idx) => (
//                     <tr key={idx} className="border-b hover:bg-gray-50">
//                       <td className="px-4 py-3">{p.name}</td>
//                       <td className="px-4 py-3">{p.orders}</td>
//                       <td className="px-4 py-3">${(p.revenue || 0).toFixed(2)}</td>
//                       <td className="px-4 py-3">${p.orders ? ((p.revenue || 0) / p.orders).toFixed(2) : '0.00'}</td>
//                     </tr>
//                   )) : (
//                     <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">No product data available.</td></tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Inventory & Region */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="bg-white p-6 rounded-2xl shadow">
//             <h3 className="text-lg font-semibold mb-4">Inventory Health</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <p className="text-sm text-gray-600">Low stock</p>
//                 <p className="font-semibold">{inventoryStats.lowStock}</p>
//               </div>
//               <div className="flex justify-between">
//                 <p className="text-sm text-gray-600">Out of stock</p>
//                 <p className="font-semibold">{inventoryStats.outOfStock}</p>
//               </div>
//               <div className="flex justify-between">
//                 <p className="text-sm text-gray-600">Inventory value</p>
//                 <p className="font-semibold">${(inventoryStats.inventoryValue || 0).toFixed(2)}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-2xl shadow lg:col-span-2">
//             <h3 className="text-lg font-semibold mb-4">Orders by Region</h3>
//             <ResponsiveContainer width="100%" height={220}>
//               <BarChart data={ordersByRegion}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="region" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="orders" fill="#2ecc71" radius={[6,6,0,0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Additional metrics row */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
//           <div className="bg-white p-6 rounded-2xl shadow">
//             <p className="text-sm text-gray-500">Avg Order Value</p>
//             <p className="text-2xl font-bold mt-1">${avgOrderValue}</p>
//           </div>
//           <div className="bg-white p-6 rounded-2xl shadow">
//             <p className="text-sm text-gray-500">Completed Orders %</p>
//             <p className="text-2xl font-bold mt-1">{completedPct}%</p>
//           </div>
//           <div className="bg-white p-6 rounded-2xl shadow">
//             <p className="text-sm text-gray-500">Return Rate</p>
//             <p className="text-2xl font-bold mt-1">{returnRate}%</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
