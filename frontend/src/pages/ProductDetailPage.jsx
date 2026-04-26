import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiFetch } from '../services/apiService';
import { formatRupiah } from '../utils/formatters';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
    </main>
  );

  if (!product) return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="font-headline text-2xl text-on-surface-variant">Product not found</p>
    </main>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 mb-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 font-label text-xs uppercase tracking-widest text-stone-400">
        <Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        {product.category && (
          <>
            <Link to={`/category/${product.category.id}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          </>
        )}
        <span className="text-primary font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Left: Image */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative group">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full opacity-30 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-sky-500/10 rounded-full opacity-20 blur-3xl" />
            <div className="relative bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 aspect-[4/5] md:aspect-[16/10] flex items-center justify-center p-8 shadow-sm">
              <img alt={product.name} loading="lazy" className="w-full h-full object-cover rounded-xl" src={product.imageUrl} />
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <span className="bg-primary text-white px-4 py-1.5 rounded-full font-label text-[10px] font-black uppercase tracking-tighter shadow-lg">Official</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {product.category && (
              <Link to={`/category/${product.category.id}`} className="flex items-center gap-2 font-label text-sm text-primary font-bold hover:underline w-max">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>sports_esports</span>
                <span>{product.category.name}</span>
              </Link>
            )}
            <h2 className="font-headline font-black text-4xl md:text-5xl text-on-background dark:text-stone-100 tracking-tighter leading-none uppercase">
              {product.name}
            </h2>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-primary to-sky-500 text-white p-6 rounded-2xl shadow-lg shadow-primary/15">
            <p className="font-label text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Harga</p>
            <span className="font-headline text-4xl font-black">Rp {formatRupiah(product.price)}</span>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-sky-50 dark:bg-sky-900/10 p-4 rounded-xl border border-sky-200/50 dark:border-sky-800/30 flex flex-col gap-1">
              <span className="font-label text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-tighter">Estimasi Proses</span>
              <div className="flex items-center gap-2 text-on-surface dark:text-stone-300">
                <span className="material-symbols-outlined text-lg">timer</span>
                <span className="font-bold text-sm">1-5 Menit</span>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/30 flex flex-col gap-1">
              <span className="font-label text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-tighter">Kategori</span>
              <div className="flex items-center gap-2 text-on-surface dark:text-stone-300">
                <span className="material-symbols-outlined text-lg">category</span>
                <span className="font-bold text-sm">{product.category?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Buy Button → Redirect to Category Step Flow */}
          <button
            onClick={() => navigate(`/category/${product.category?.id || product.categoryId}`)}
            className="w-full bg-gradient-to-r from-primary to-sky-500 text-white font-headline text-xl font-black py-5 rounded-xl uppercase tracking-widest shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
          >
            <span>Beli Sekarang</span>
            <span className="material-symbols-outlined text-2xl group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </button>

          {/* Description */}
          <div className="bg-stone-50 dark:bg-stone-800/30 p-6 rounded-xl border border-stone-200 dark:border-stone-700">
            <h3 className="font-headline font-bold text-lg text-on-surface dark:text-stone-200 mb-3 flex items-center gap-2 uppercase">
              <span className="material-symbols-outlined text-primary">description</span> Detail Produk
            </h3>
            <p className="text-stone-600 dark:text-stone-400 font-body leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
