import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiService';
import { formatRupiah } from '../utils/formatters';
import { useToast } from '../components/ToastProvider';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    const ids = saved ? JSON.parse(saved) : [];
    setWishlist(ids);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch all categories then filter by wishlist IDs
    apiFetch('/categories')
      .then(res => {
        const all = res.data || [];
        const filtered = all.filter(c => ids.includes(c.id));
        setCategories(filtered);
      })
      .catch(() => toast.error('Gagal memuat wishlist'))
      .finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = (categoryId) => {
    const updated = wishlist.filter(id => id !== categoryId);
    setWishlist(updated);
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Game dihapus dari favorit');
  };

  const clearAll = () => {
    setWishlist([]);
    setCategories([]);
    localStorage.removeItem('wishlist');
    toast.success('Semua game favorit dihapus');
  };

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl min-h-screen mb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline font-black text-3xl md:text-5xl uppercase tracking-tighter italic">
          Game <span className="text-primary">Favorit</span>
        </h1>
        {categories.length > 0 && (
          <button onClick={clearAll} className="text-xs font-label font-bold text-red-500 hover:text-red-600 uppercase tracking-wider transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">delete_sweep</span> Hapus Semua
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-surface-container-low dark:bg-stone-900 rounded-2xl p-12 text-center comic-outline border-2 border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-stone-300 dark:text-stone-700 mb-4 inline-block">
            favorite
          </span>
          <h2 className="font-headline font-black text-2xl uppercase mb-2">Belum Ada Game Favorit!</h2>
          <p className="font-body text-stone-500 mb-8">Tandai game favoritmu supaya gampang top-up lagi nanti.</p>
          <Link to="/catalog" className="inline-block bg-primary text-white font-label font-bold uppercase tracking-widest px-8 py-4 rounded-full comic-shadow hover:-translate-y-1 transition-all">
            Eksplorasi Game
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="group relative rounded-xl overflow-hidden aspect-square comic-outline cursor-pointer hover:-translate-y-1.5 transition-all duration-300 shadow-sm hover:shadow-xl border-2 border-transparent hover:border-primary/50 flex flex-col" 
              onClick={() => navigate(`/category/${cat.id}`)}
            >
              {cat.iconUrl ? (
                <img src={cat.iconUrl} alt={cat.name} loading="lazy" decoding="async" className="w-full h-full absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-primary/20 to-sky-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-primary/30" style={{ fontVariationSettings: "'FILL' 1" }}>sports_esports</span>
                </div>
              )}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/20 to-transparent flex flex-col justify-end p-3 md:p-4">
                <h3 className="font-headline font-black text-white text-xs md:text-sm uppercase leading-tight drop-shadow-lg group-hover:text-sky-300 transition-colors">{cat.name}</h3>
                <p className="text-[9px] text-white/60 font-label font-bold mt-0.5">{cat._count?.products || 0} item</p>
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => { e.stopPropagation(); removeFromWishlist(cat.id); }}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 hover:scale-110 active:scale-90 transition-all border border-stone-200/50 dark:border-stone-700/50 z-10"
              >
                <span className="material-symbols-outlined text-red-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
