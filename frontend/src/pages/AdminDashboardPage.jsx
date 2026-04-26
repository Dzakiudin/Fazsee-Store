import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

import OrdersTab from '../components/admin/OrdersTab';
import CategoriesTab from '../components/admin/CategoriesTab';
import ProductsTab from '../components/admin/ProductsTab';
import SettingsTab from '../components/admin/SettingsTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import CategoryModal from '../components/admin/CategoryModal';
import ProductModal from '../components/admin/ProductModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    Promise.all([fetchOrders(), fetchProducts(), fetchCategories()])
      .finally(() => setLoading(false));
  }, [token]);

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/admin/orders?limit=100`, { headers: authHeaders });
      const result = await res.json();
      if (!res.ok) {
        if (res.status === 403) { toast.error('Akses ditolak.'); navigate('/'); return; }
        throw new Error(result.message || 'Unauthorized');
      }
      setOrders(result.data?.orders || []);
    } catch (err) {
      if (err.message.includes('Unauthorized') || err.message.includes('Invalid token')) {
        toast.error('Sesi admin berakhir.'); localStorage.removeItem('token'); navigate('/login');
      } else { toast.error('Gagal mengambil data order'); }
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/admin/products?limit=100`, { headers: authHeaders });
      const result = await res.json();
      if (res.ok) setProducts(result.data?.products || []);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/admin/categories`, { headers: authHeaders });
      const result = await res.json();
      if (res.ok) setCategories(result.data || []);
    } catch (err) { console.error(err); }
  };

  const verifyOrder = async (orderId, nextStatus) => {
    if (!window.confirm(`Konfirmasi mark as ${nextStatus}?`)) return;
    try {
      const res = await fetch(`${API}/admin/orders/${orderId}/status`, {
        method: 'PATCH', headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) { toast.success('Status order berhasil diubah!'); fetchOrders(); }
      else { const e = await res.json(); toast.error(e.message || 'Gagal'); }
    } catch { toast.error('Kesalahan Jaringan'); }
  };

  const toggleProductStatus = async (id, isActive) => {
    const msg = isActive ? 'Sembunyikan produk ini?' : 'Pulihkan produk ini?';
    if (!window.confirm(msg)) return;
    try {
      if (isActive) {
        const res = await fetch(`${API}/admin/products/${id}`, { method: 'DELETE', headers: authHeaders });
        if (res.ok) { toast.success('Produk disembunyikan'); fetchProducts(); } else toast.error('Gagal');
      } else {
        const fd = new FormData(); fd.append('isActive', 'true');
        const res = await fetch(`${API}/admin/products/${id}`, { method: 'PATCH', headers: authHeaders, body: fd });
        if (res.ok) { toast.success('Produk dipulihkan'); fetchProducts(); } else toast.error('Gagal');
      }
    } catch { toast.error('Koneksi bermasalah'); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Sembunyikan kategori ini beserta produknya?')) return;
    try {
      const res = await fetch(`${API}/admin/categories/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) { toast.success('Kategori disembunyikan'); fetchCategories(); } else toast.error('Gagal');
    } catch { toast.error('Koneksi bermasalah'); }
  };

  const TABS = [
    { id: 'analytics', label: 'Analitik', icon: 'analytics', count: 0 },
    { id: 'orders', label: 'Pesanan', icon: 'receipt_long', count: orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length },
    { id: 'categories', label: 'Kategori', icon: 'category', count: categories.length },
    { id: 'products', label: 'Produk', icon: 'inventory_2', count: products.filter(p => p.isActive).length },
    { id: 'settings', label: 'Pengaturan', icon: 'settings', count: 0 },
  ];

  return (
    <main className="pt-8 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      <header className="mb-6 md:mb-10 relative overflow-hidden bg-gradient-to-br from-primary/90 to-sky-600 rounded-2xl p-6 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-primary/10">
        <div className="z-10 text-center md:text-left space-y-2 md:space-y-3">
          <h1 className="text-2xl md:text-4xl font-headline font-black text-white tracking-tight leading-none uppercase">
            Admin <span className="text-sky-200">Dashboard</span>
          </h1>
          <p className="text-white/70 max-w-md font-medium">
            Kelola kategori, produk, dan pesanan toko Anda.
          </p>
        </div>
        <div className="relative w-32 h-32 md:w-40 md:h-40 mt-6 md:mt-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl" />
          <span className="material-symbols-outlined text-[100px] text-white/30" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
        </div>
      </header>

      <div className="flex border-b-2 border-outline-variant/30 dark:border-stone-800 mb-8 overflow-x-auto hide-scrollbar gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3.5 font-label text-sm font-bold uppercase tracking-wider border-b-3 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-stone-200 dark:bg-stone-800 text-stone-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-stone-500 py-10 font-bold"><span className="material-symbols-outlined animate-spin align-middle mr-2">sync</span>Memuat Data...</p>}

      {!loading && activeTab === 'analytics' && <AnalyticsTab token={token} />}
      {!loading && activeTab === 'orders' && <OrdersTab orders={orders} verifyOrder={verifyOrder} />}
      {!loading && activeTab === 'categories' && (
        <CategoriesTab 
          categories={categories} 
          onAdd={() => { setEditingCategory(null); setShowCategoryModal(true); }}
          onEdit={(cat) => { setEditingCategory(cat); setShowCategoryModal(true); }}
          onDelete={deleteCategory}
        />
      )}
      {!loading && activeTab === 'products' && (
        <ProductsTab
          products={products}
          onAdd={() => { setEditingProduct(null); setShowProductModal(true); }}
          onEdit={(prod) => { setEditingProduct(prod); setShowProductModal(true); }}
          onToggleStatus={toggleProductStatus}
        />
      )}
      {!loading && activeTab === 'settings' && (
        <SettingsTab token={token} />
      )}

      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setShowCategoryModal(false)}
          onSuccess={() => { setShowCategoryModal(false); fetchCategories(); }}
          token={token}
        />
      )}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setShowProductModal(false)}
          onSuccess={() => { setShowProductModal(false); fetchProducts(); }}
          token={token}
        />
      )}
    </main>
  );
}
