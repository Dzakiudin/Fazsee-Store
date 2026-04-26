import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import useSWR from 'swr';
import { apiFetch, apiFetcher } from '../services/apiService';
import Footer from '../layouts/Footer';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // SWR automatic caching & fetching
  const { data: categories = [], isLoading: loading } = useSWR('/categories', apiFetcher);
  const { data: popularProducts = [], isLoading: popularLoading } = useSWR('/products/popular', apiFetcher);


  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const promoSlides = [
    {
      id: 1,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCGYpoGGYqMJpCU28Fw58OzkTH9CI_z0l3dks1rY7augRcj31_bXzjt1j-67tRbs3CqmEoR7TYv2t4xu17M6P1anSQy0y0C_fSzbHeFGOT-vrojBbfrvZe8-pu5lfySJaVhsuiHgq5V_Ywa0Pn2lSr5ugX0mvlEfyb5GoNDQqNagCzPYr1e7xbYm1z8NQeSAhAvVL7UARGd6v4Wh2OjoOeJNeufshe2OtMyIqEVthVzAQbLJM2aTxzxe9CjbT5-3itjX2oIsWqJ1E",
      badge: "Flash Sale!",
      title: "Top Up Bebas <br/>Tanpa Antri!",
      gradient: "from-sky-900/80"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
      badge: "Diskon 50%",
      title: "Promo Besar <br/>Akhir Pekan!",
      gradient: "from-purple-900/80"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=2000&auto=format&fit=crop",
      badge: "Gamer VIP",
      title: "Hadiah Eksklusif <br/>Pengguna Baru!",
      gradient: "from-emerald-900/80"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4500); // changes every 4.5 seconds
    return () => clearInterval(timer);
  }, []);

  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-surface-container-lowest dark:bg-stone-950 pb-20 overflow-x-hidden relative">
      <Helmet>
        <title>Fazsee Store — Top Up Game Murah & Cepat</title>
        <meta name="description" content="Top up diamond, koin, dan item game favoritmu dengan harga terbaik. Mobile Legends, Free Fire, Genshin Impact, dan lainnya." />
        <meta property="og:title" content="Fazsee Store — Top Up Game Murah & Cepat" />
        <meta property="og:description" content="Top up diamond, koin & voucher game favoritmu. Proses instan, harga bersahabat!" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-400/10 to-transparent pointer-events-none z-0" />
      <div className="absolute top-40 right-[-10%] w-[30%] h-96 bg-primary/5 blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 pt-8">

        {/* 1. Search Bar */}
        <div className="relative w-full mb-8">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 text-xl pointer-events-none">search</span>
          <input
            type="text"
            placeholder="Cari game / produk"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-full py-4 pl-14 pr-6 font-body text-sm font-semibold focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-300 text-on-surface dark:text-stone-100 placeholder:text-stone-400 shadow-sm"
          />
        </div>

        {/* 2. Banner Promo Slider */}
        <section className="mb-14 group">
          <div className="w-full rounded-2xl overflow-hidden comic-outline comic-shadow relative aspect-[21/9] md:aspect-[3/1] bg-stone-900 border-4 border-white dark:border-stone-800">
            {promoSlides.map((slide, idx) => (
              <div 
                key={slide.id} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img
                  src={slide.image}
                  className={`w-full h-full object-cover opacity-80 transition-transform duration-[6000ms] ease-linear ${currentSlide === idx ? 'scale-105' : 'scale-100'}`}
                  alt={`Promo Banner ${idx + 1}`}
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} to-transparent flex items-center p-8 md:p-12`}>
                  <div className="max-w-md">
                    <span className="bg-primary text-white font-label text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest comic-outline mb-3 inline-block shadow-sm">
                      {slide.badge}
                    </span>
                    <h2 
                      className="font-headline font-black text-3xl md:text-5xl text-white uppercase italic leading-none drop-shadow-lg"
                      dangerouslySetInnerHTML={{ __html: slide.title }} 
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Slider Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {promoSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'bg-white shadow-md scale-110 w-6' : 'bg-white/40 hover:bg-white/70 w-2.5 cursor-pointer'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 3. GAME POPULER (Horizontal Cards) */}
        {!searchQuery && (
          <section className="mb-14">
            <h2 className="font-headline font-black text-xl md:text-2xl uppercase flex items-center gap-2 mb-6 text-on-surface dark:text-stone-100 italic tracking-tight">
              <span>🔥</span> PRODUK POPULER
            </h2>

            {popularLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse bg-white dark:bg-stone-900 border-2 border-outline-variant/20 dark:border-stone-800 rounded-xl p-2 md:p-3 flex items-center gap-3">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-stone-200 dark:bg-stone-800 rounded-lg shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-full mb-1" />
                      <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {popularProducts.map(product => (
                  <Link
                    key={`popular-${product.id}`}
                    to={`/category/${product.categoryId}`}
                    className="group bg-white dark:bg-stone-900 border-2 border-stone-200/80 dark:border-stone-800/80 rounded-xl p-2 md:p-3 flex items-center gap-3 hover:border-primary/50 dark:hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 md:w-14 md:h-14 rounded-lg object-cover comic-outline shadow-sm group-hover:scale-105 transition-transform shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-primary text-xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <h3 className="font-headline font-black text-[10px] md:text-sm text-on-surface dark:text-stone-100 uppercase truncate leading-tight">{product.name}</h3>
                      <p className="font-label text-[8px] md:text-[10px] text-on-surface-variant font-bold truncate opacity-60 leading-none">
                        {product.category?.name || 'Produk'} {product.totalQty > 0 ? `• ${product.totalQty} Terjual🔥` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 4. Semua Game Grid */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-black text-xl md:text-2xl uppercase flex items-center gap-2 text-on-surface dark:text-stone-100 italic tracking-tight">
              <span className="material-symbols-outlined text-primary">grid_view</span> SEMUA GAME
            </h2>
            <Link to="/catalog" className="text-xs font-label font-bold text-primary uppercase tracking-wider hover:underline flex items-center gap-1">
              Lihat Semua <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <div key={`skeleton-${i}`} className="animate-pulse flex flex-col gap-2">
                  <div className="aspect-square rounded-xl bg-stone-200 dark:bg-stone-800 w-full mb-1" />
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {filtered.map(cat => (
                <Link
                  key={`grid-${cat.id}`}
                  to={`/category/${cat.id}`}
                  className="group relative bg-white dark:bg-stone-900 rounded-2xl border-2 border-stone-200/60 dark:border-stone-800 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 flex flex-col"
                >
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

              {filtered.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <span className="material-symbols-outlined text-6xl text-stone-300 dark:text-stone-700 mb-4">search_off</span>
                  <p className="font-label text-stone-500 font-bold uppercase tracking-widest">Tidak ada game ditemukan</p>
                </div>
              )}
            </div>
          )}

          {/* Button Lihat Selengkapnya */}
          <div className="flex justify-center mt-10">
            <Link to="/catalog" className="bg-primary/10 text-primary dark:text-sky-400 hover:bg-primary hover:text-white px-8 py-3.5 rounded-full font-headline font-semibold uppercase tracking-wider transition-all border border-primary/20 hover:border-primary shadow-sm hover:shadow-md outline-none focus:ring-4 focus:ring-primary/20 flex items-center gap-2 hover:-translate-y-1 active:scale-[0.98]">
              Lihat Seluruh Game <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-8 border-t-2 border-outline-variant/20 dark:border-stone-800/50">
        <Footer />
      </div>
    </main>
  );
}
