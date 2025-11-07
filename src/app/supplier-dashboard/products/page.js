'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/button';

const ProductSkeleton = () => (
  <div className="animate-pulse bg-white rounded-2xl shadow p-4">
    <div className="h-40 bg-gray-200 rounded-xl mb-3" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </div>
);

export default function SupplierProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    supplier_id: null,
    category_id: '',
    name: '',
    description: '',
    price: '',
    stock: '',
    images: [],
  });

  // 🧮 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  // ✅ Load supplier products and categories
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(storedUser);
    if (parsed.role !== 'supplier' || !parsed.id) {
      setLoading(false);
      return;
    }

    setForm((prev) => ({ ...prev, supplier_id: parsed.id }));
    fetchCategories();
    fetchProducts(parsed.id, 1); // initial load (page 1)
  }, []);

  // ✅ Fetch all products for this supplier (with pagination)
  const fetchProducts = async (id, page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/supplier/products?supplier_id=${id}&page=${page}&limit=${itemsPerPage}`
      );
      const data = await res.json();

      if (data.success) {
        const formatted = (data.data || []).map((p) => ({
          ...p,
          images: (() => {
            try {
              const arr = JSON.parse(p.images);
              return Array.isArray(arr) ? arr : [];
            } catch {
              return [];
            }
          })(),
        }));

        setProducts(formatted);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.page || 1);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      const categoriesArray = Array.isArray(data) ? data : data.data || [];
      setCategories(categoriesArray);
    } catch (err) {
      console.error('❌ Error loading categories:', err);
      setCategories([]);
    }
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/supplier/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts(form.supplier_id, currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Add/Edit product
  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingProduct ? 'PATCH' : 'POST';
    const body = editingProduct ? { ...form, id: editingProduct.id } : form;

    const res = await fetch('/api/supplier/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowModal(false);
      setEditingProduct(null);
      fetchProducts(form.supplier_id, currentPage);
    } else alert('Error saving product');
  };

  // ✅ Pagination controls
  const handlePrev = () => {
    if (currentPage > 1) {
      fetchProducts(form.supplier_id, currentPage - 1);
    }
  };
  const handleNext = () => {
    if (currentPage < totalPages) {
      fetchProducts(form.supplier_id, currentPage + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#004a7c]">My Products</h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setForm({
              supplier_id: form.supplier_id,
              category_id: '',
              name: '',
              description: '',
              price: '',
              stock: '',
              images: [],
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#004a7c] to-[#005691] text-white hover:opacity-90"
        >
          <Plus size={18} /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-[#004a7c] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-gray-500" size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#004a7c]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-56 bg-gray-100">
                  <Image
                    src={p.images?.[0] || '/images/products/placeholder.svg'}
                    alt={p.name || 'Product Image'}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-semibold text-lg text-gray-800 truncate">{p.name}</h3>
                  <p className="text-gray-600 text-sm truncate">{p.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[#004a7c] font-bold">${p.price}</span>
                    <span className="text-gray-500 text-sm">Stock: {p.stock}</span>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setForm({ ...p });
                        setShowModal(true);
                      }}
                      className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      <Pencil size={18} className="text-[#004a7c]" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg border ${
                currentPage === 1
                  ? 'text-gray-400 border-gray-200'
                  : 'text-[#004a7c] border-[#004a7c] hover:bg-[#004a7c]/10'
              }`}
            >
              <ChevronLeft size={18} /> Prev
            </button>

            <span className="font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg border ${
                currentPage === totalPages
                  ? 'text-gray-400 border-gray-200'
                  : 'text-[#004a7c] border-[#004a7c] hover:bg-[#004a7c]/10'
              }`}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">No products found</h2>
          <p className="text-gray-500 mt-2">Try adding a new product.</p>
        </div>
      )}
    </div>
  );
}







// 'use client';

// import { useEffect, useState } from 'react';
// import { Plus, Pencil, Trash2, Search, Filter, X } from 'lucide-react';
// import Image from 'next/image';

// export default function SupplierProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [supplierId, setSupplierId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [form, setForm] = useState({
//     supplier_id: null,
//     category_id: '',
//     name: '',
//     description: '',
//     price: '',
//     retail_price: '',
//     stock: '',
//     images: [],
//   });

//   // Load supplier ID + products
//   useEffect(() => {
//     const id = localStorage.getItem('supplier_id');
//     if (id) {
//       setSupplierId(id);
//       setForm((prev) => ({ ...prev, supplier_id: id }));
//       fetchProducts(id);
//       fetchCategories();
//     } else {
//       console.warn('No supplier ID found in localStorage');
//       setLoading(false);
//     }
//   }, []);

//   // Fetch all products of this supplier
//   const fetchProducts = async (id) => {
//     try {
//       const res = await fetch(`/api/supplier/products?supplier_id=${id}`);
//       const data = await res.json();
//       setProducts(data);
//       setFilteredProducts(data);
//     } catch (err) {
//       console.error('Error loading products:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch categories
//   const fetchCategories = async () => {
//     try {
//       const res = await fetch('/api/categories');
//       const data = await res.json();
//       setCategories(data);
//     } catch (err) {
//       console.error('Error loading categories:', err);
//     }
//   };

//   // Filter + Search logic
//   useEffect(() => {
//     let filtered = products;

//     if (categoryFilter !== 'all') {
//       filtered = filtered.filter((p) => p.category_id == categoryFilter);
//     }

//     if (searchTerm.trim() !== '') {
//       filtered = filtered.filter(
//         (p) =>
//           p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           p.description.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     setFilteredProducts(filtered);
//   }, [categoryFilter, searchTerm, products]);

//   const handleDelete = async (id) => {
//     if (!confirm('Delete this product?')) return;
//     try {
//       const res = await fetch(`/api/supplier/products?id=${id}`, { method: 'DELETE' });
//       if (res.ok) {
//         alert('✅ Product deleted!');
//         fetchProducts(supplierId);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleSaveProduct = async (e) => {
//     e.preventDefault();
//     const url = '/api/supplier/products';
//     const method = editingProduct ? 'PATCH' : 'POST';
//     const body = editingProduct ? { ...form, id: editingProduct.id } : form;

//     const res = await fetch(url, {
//       method,
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body),
//     });

//     if (res.ok) {
//       alert(editingProduct ? '✅ Product updated!' : '✅ Product added!');
//       setShowModal(false);
//       setEditingProduct(null);
//       fetchProducts(supplierId);
//     } else {
//       alert('Error saving product');
//     }
//   };

//   if (loading) return <div className="text-center p-10 text-gray-600">Loading...</div>;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
//         <button
//           onClick={() => {
//             setEditingProduct(null);
//             setForm({
//               supplier_id: supplierId,
//               category_id: '',
//               name: '',
//               description: '',
//               price: '',
//               retail_price: '',
//               stock: '',
//               images: [],
//             });
//             setShowModal(true);
//           }}
//           className="flex items-center gap-2 bg-gradient-to-r from-[#004a7c] to-[#005691] text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 transition"
//         >
//           <Plus size={18} /> Add Product
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
//         <div className="relative w-full sm:w-1/3">
//           <Search className="absolute left-3 top-3 text-gray-400" size={18} />
//           <input
//             type="text"
//             placeholder="Search by name or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 pr-4 py-2 w-full border rounded-xl focus:ring-2 focus:ring-[#004a7c] outline-none"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <Filter className="text-gray-500" size={18} />
//           <select
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//             className="border rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#004a7c] outline-none"
//           >
//             <option value="all">All Categories</option>
//             {categories.map((cat) => (
//               <option key={cat.id} value={cat.id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Products Table */}
//       <div className="bg-white rounded-2xl shadow overflow-x-auto">
//         {filteredProducts.length > 0 ? (
//           <table className="min-w-full text-left">
//             <thead>
//               <tr className="bg-gray-100 text-gray-700 text-sm">
//                 <th className="px-4 py-2">Image</th>
//                 <th className="px-4 py-2">Name</th>
//                 <th className="px-4 py-2">Category</th>
//                 <th className="px-4 py-2">Price</th>
//                 <th className="px-4 py-2">Stock</th>
//                 <th className="px-4 py-2 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredProducts.map((p) => (
//                 <tr key={p.id} className="border-b hover:bg-gray-50 transition">
//                   <td className="px-4 py-2">
//                     <div className="relative w-14 h-14 rounded-md overflow-hidden">
//                       <Image
//                         src={p.images ? JSON.parse(p.images)[0] : '/Images/placeholder.jpg'}
//                         alt={p.name}
//                         fill
//                         className="object-cover"
//                       />
//                     </div>
//                   </td>
//                   <td className="px-4 py-2 font-medium text-gray-800">{p.name}</td>
//                   <td className="px-4 py-2 text-gray-600">
//                     {categories.find((c) => c.id === p.category_id)?.name || '-'}
//                   </td>
//                   <td className="px-4 py-2 text-gray-800">${p.price}</td>
//                   <td className="px-4 py-2 text-gray-800">{p.stock}</td>
//                   <td className="px-4 py-2 flex justify-center gap-3">
//                     <button
//                       onClick={() => {
//                         setEditingProduct(p);
//                         setForm({
//                           ...p,
//                           images: p.images ? JSON.parse(p.images) : [],
//                         });
//                         setShowModal(true);
//                       }}
//                       className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100"
//                     >
//                       <Pencil size={18} className="text-[#004a7c]" />
//                     </button>
//                     <button
//                       onClick={() => handleDelete(p.id)}
//                       className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
//                     >
//                       <Trash2 size={18} className="text-red-600" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <div className="text-center text-gray-500 py-10">No products found.</div>
//         )}
//       </div>

//       {/* Modal for Add/Edit */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
//             <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
//               <X size={24} />
//             </button>
//             <h2 className="text-2xl font-bold text-[#004a7c] mb-6">
//               {editingProduct ? 'Edit Product' : 'Add New Product'}
//             </h2>

//             <form onSubmit={handleSaveProduct} className="grid gap-4">
//               <input
//                 type="text"
//                 placeholder="Product Name"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//                 required
//               />
//               <textarea
//                 placeholder="Description"
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//               />
//               <select
//                 value={form.category_id}
//                 onChange={(e) => setForm({ ...form, category_id: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//                 required
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 type="number"
//                 placeholder="Price"
//                 value={form.price}
//                 onChange={(e) => setForm({ ...form, price: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//                 required
//               />
//               <input
//                 type="number"
//                 placeholder="Stock"
//                 value={form.stock}
//                 onChange={(e) => setForm({ ...form, stock: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//               />

//               <button
//                 type="submit"
//                 className="mt-4 bg-gradient-to-r from-[#004a7c] to-[#005691] text-white py-3 rounded-full font-semibold hover:opacity-90 transition"
//               >
//                 {editingProduct ? 'Update Product' : 'Save Product'}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// 'use client';

// import { useEffect, useState } from 'react';
// import { Plus, Pencil, Trash2, X } from 'lucide-react';
// import Image from 'next/image';

// export default function ProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [supplierId, setSupplierId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [form, setForm] = useState({
//     supplier_id: null,
//     category_id: '',
//     name: '',
//     description: '',
//     price: '',
//     retail_price: '',
//     stock: '',
//     images: [],
//   });

//   // Get logged-in supplier ID (example: from localStorage or context)
// useEffect(() => {
//   const loggedInSupplierId = localStorage.getItem('supplier_id'); 
//   if (loggedInSupplierId) {
//     setSupplierId(loggedInSupplierId);
//     setForm((prev) => ({ ...prev, supplier_id: loggedInSupplierId }));
//     fetchProducts(loggedInSupplierId);
//   } else {
//     console.warn('No supplier ID found in localStorage');
//     setLoading(false); // stop loading if no supplier
//   }
// }, []);


//   // Fetch products for this supplier
//   const fetchProducts = async (id) => {
//     if (!id) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/supplier/products?supplier_id=${id}`);
//       const data = await res.json();
//       setProducts(data);
//     } catch (err) {
//       console.error('Error loading products:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Add or Edit product
//   const handleSaveProduct = async (e) => {
//     e.preventDefault();
//     try {
//       const url = '/api/supplier/products';
//       const method = editingProduct ? 'PATCH' : 'POST';
//       const body = editingProduct ? { ...form, id: editingProduct.id } : form;

//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         alert(editingProduct ? '✅ Product updated!' : '✅ Product added!');
//         setShowModal(false);
//         setEditingProduct(null);
//         setForm((prev) => ({ ...prev, name: '', description: '', price: '', retail_price: '', stock: '', images: [] }));
//         fetchProducts(supplierId);
//       } else {
//         alert(data.error || 'Error saving product');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   // Delete product
//   const handleDelete = async (id) => {
//     if (!confirm('Are you sure you want to delete this product?')) return;
//     try {
//       const res = await fetch(`/api/supplier/products?id=${id}`, { method: 'DELETE' });
//       const data = await res.json();
//       if (res.ok) {
//         alert('✅ Product deleted!');
//         fetchProducts(supplierId);
//       } else {
//         alert(data.error || 'Error deleting product');
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) return <div className="text-center p-10 text-gray-600">Loading...</div>;

//   return (
//     <div className="w-full relative">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="text-3xl font-bold text-[#004a7c]">My Products</h1>
//         <button
//           onClick={() => {
//             setShowModal(true);
//             setEditingProduct(null);
//             setForm((prev) => ({ ...prev, name: '', description: '', price: '', retail_price: '', stock: '', images: [] }));
//           }}
//           className="flex items-center gap-2 bg-gradient-to-r from-[#004a7c] to-[#005691] text-white px-5 py-3 rounded-xl font-medium hover:opacity-90 transition"
//         >
//           <Plus size={18} /> Add Product
//         </button>
//       </div>

//       {/* Products Table */}
//       {/* Products Table */}
// <div className="bg-white rounded-2xl shadow-md overflow-hidden">
//   {products.length > 0 ? (
//     <table className="w-full border-collapse text-left">
//       <thead className="bg-[#e8f1f5] text-[#004a7c] uppercase text-sm font-semibold">
//         <tr>
//           <th className="p-4">Image</th>
//           <th className="p-4">Name</th>
//           <th className="p-4">Category</th>
//           <th className="p-4">Price</th>
//           <th className="p-4">Stock</th>
//           <th className="p-4 text-center">Actions</th>
//         </tr>
//       </thead>
//       <tbody>
//         {products.map((product) => (
//           <tr key={product.id} className="border-t hover:bg-gray-50 transition">
//             <td className="p-4">
//               {product.images ? (
//                 <div className="relative w-16 h-16 rounded-lg overflow-hidden">
//                   <Image
//                     src={JSON.parse(product.images)[0] || '/Images/placeholder.jpg'}
//                     alt={product.name}
//                     fill
//                     className="object-cover"
//                   />
//                 </div>
//               ) : (
//                 <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
//                   No Img
//                 </div>
//               )}
//             </td>
//             <td className="p-4 font-medium text-gray-700">{product.name}</td>
//             <td className="p-4 text-gray-600">{product.category || '-'}</td>
//             <td className="p-4 text-gray-700">${product.price}</td>
//             <td className="p-4 text-gray-700">{product.stock}</td>
//             <td className="p-4 flex justify-center gap-3">
//               <button
//                 className="p-2 bg-[#e8f1f5] rounded-lg hover:bg-[#dceaf0]"
//                 onClick={() => {
//                   setEditingProduct(product);
//                   setForm({ ...product, images: product.images ? JSON.parse(product.images) : [] });
//                   setShowModal(true);
//                 }}
//               >
//                 <Pencil size={18} className="text-[#004a7c]" />
//               </button>
//               <button
//                 className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
//                 onClick={() => handleDelete(product.id)}
//               >
//                 <Trash2 size={18} className="text-red-600" />
//               </button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   ) : (
//     <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
//       <p className="mb-4 text-lg">You haven’t added any products yet.</p>
//       <button
//         onClick={() => setShowModal(true)}
//         className="bg-gradient-to-r from-[#004a7c] to-[#005691] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
//       >
//         + Add Your First Product
//       </button>
//     </div>
//   )}
// </div>


//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
//             <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
//               <X size={24} />
//             </button>
//             <h2 className="text-2xl font-bold text-[#004a7c] mb-6">
//               {editingProduct ? 'Edit Product' : 'Add New Product'}
//             </h2>

//             <form onSubmit={handleSaveProduct} className="grid gap-4">
//               <input
//                 type="text"
//                 placeholder="Product Name"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//                 required
//               />
//               <textarea
//                 placeholder="Description"
//                 value={form.description}
//                 onChange={(e) => setForm({ ...form, description: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//               />
//               <input
//                 type="number"
//                 placeholder="Price"
//                 value={form.price}
//                 onChange={(e) => setForm({ ...form, price: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//                 required
//               />
//               <input
//                 type="number"
//                 placeholder="Retail Price"
//                 value={form.retail_price}
//                 onChange={(e) => setForm({ ...form, retail_price: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//               />
//               <input
//                 type="number"
//                 placeholder="Stock"
//                 value={form.stock}
//                 onChange={(e) => setForm({ ...form, stock: e.target.value })}
//                 className="border border-gray-300 rounded-lg px-4 py-3"
//               />

//               <button
//                 type="submit"
//                 className="mt-4 bg-gradient-to-r from-[#004a7c] to-[#005691] text-white py-3 rounded-full font-semibold hover:opacity-90 transition"
//               >
//                 {editingProduct ? 'Update Product' : 'Save Product'}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
