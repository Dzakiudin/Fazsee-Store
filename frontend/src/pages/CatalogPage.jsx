import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import useSWR from 'swr';
import { apiFetch, apiFetcher } from '../services/apiService';
import { SkeletonGrid } from '../components/SkeletonCard';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [wishlist, setWishlist] = useState([]);

  // SWR automatically handles fetching and caching!
  const { data: categories = [], isLoading: loading } = useSWR('/categories', apiFetcher);

  useEffect(() => {
    setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));
    const handleUpdate = () => setWishlist(JSON.parse(localStorage.getItem('wishlist') || '[]'));
    window.addEventListener('wishlist-update', handleUpdate);
    return () => window.removeEventListener('wishlist-update', handleUpdate);
  }, []);

  const toggleFavorite = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    let updated = [...wishlist];
    if (updated.includes(id)) {
      updated = updated.filter(i => i !== id);
    } else {
      updated.push(id);
    }
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-update'));
  };

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    setSearchQuery(currentSearch);
  }, [searchParams]);

  // Removed old fetch useEffect in favor of SWR

  const filtered = categories.filter(cat => {
    const matchSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <main className="pt-6 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Katalog Game — Fazsee Store</title>
        <meta name="description" content="Jelajahi semua game yang tersedia di Fazsee Store. Pilih dan top up game favoritmu sekarang!" />
      </Helmet>
      {/* Hero Header */}
      <header className="mb-12">
        <div className="bg-gradient-to-br from-primary/90 to-sky-600 rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-sky-300 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white font-label font-extrabold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              <span className="material-symbols-outlined text-[14px]">sports_esports</span>
              GAME CATALOG
            </span>
            <h1 className="font-headline font-black text-3xl md:text-5xl text-white leading-tight mb-3">
              Pilih Game<br/>Favoritmu
            </h1>
            <p className="text-white/80 max-w-md font-body text-base">
              Top up diamond, koin, dan item favorit dari berbagai game populer dengan harga terbaik.
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <section className="mb-10 w-full relative z-20 -mt-6">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 text-xl group-focus-within:text-primary transition-colors pointer-events-none">search</span>
          <input
            type="text"
            placeholder="Cari game..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val.trim()) {
                setSearchParams({ search: val });
              } else {
                searchParams.delete('search');
                setSearchParams(searchParams);
              }
            }}
            className="w-full bg-white dark:bg-stone-900 border-2 border-stone-200/60 dark:border-stone-800 rounded-full py-4 pl-14 pr-6 font-body text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface dark:text-stone-100 placeholder:text-stone-400 shadow-lg shadow-stone-900/5"
          />
        </div>
      </section>

      {/* Category Count */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline font-black text-lg uppercase tracking-tight text-on-surface dark:text-stone-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
          Semua Game
        </h2>
        <span className="text-xs font-label font-bold text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
          {filtered.length} game
        </span>
      </div>

      {/* Game Grid */}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-stone-300 dark:text-stone-700">search_off</span>
          <p className="font-label text-stone-500 font-bold uppercase tracking-widest mt-4">Game tidak ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {filtered.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="group relative bg-white dark:bg-stone-900 rounded-2xl border-2 border-stone-200/60 dark:border-stone-800 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 flex flex-col"
            >
              <button 
                onClick={(e) => toggleFavorite(e, cat.id)}
                className="absolute top-2 right-2 w-8 h-8 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md z-10 hover:scale-110 active:scale-95 transition-all text-stone-300 dark:text-stone-600 hover:text-red-500 border border-stone-200/50 dark:border-stone-700/50"
              >
                <span className={`material-symbols-outlined text-[16px] ${wishlist.includes(cat.id) ? 'text-red-500' : ''}`} style={{ fontVariationSettings: wishlist.includes(cat.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
              </button>
              {/* Icon/Image */}
              <div className="relative aspect-square bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-900 flex items-center justify-center overflow-hidden">
                {cat.iconUrl ? (
                  <img
                    src={cat.iconUrl}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-stone-300 dark:text-stone-600 group-hover:text-primary/40 transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>
                    sports_esports
                  </span>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Info */}
              <div className="p-3 md:p-4 flex flex-col gap-1">
                <h3 className="font-headline font-bold text-sm md:text-base text-on-surface dark:text-stone-100 leading-tight group-hover:text-primary transition-colors truncate">
                  {cat.name}
                </h3>
                {cat._count?.products > 0 && (
                  <span className="text-[10px] font-label font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                    {cat._count.products} item
                  </span>
                )}
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-white text-[16px]">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
