import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { useToast } from '../components/ToastProvider';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  const [navSearch, setNavSearch] = useState('');
  const toast = useToast();
  
  // Swipe Handlers for Sidebar
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) setIsMobileMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  // Baca Token untuk Auth State
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      isAdmin = payload.role === 'admin';
    } catch(e) {}
  }

  const handleWishlistClick = () => {
    navigate('/wishlist');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(navSearch)}`);
    } else {
      navigate('/catalog');
    }
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/catalog', label: 'Semua Produk' },
    { path: '/orders', label: 'Cek Invoice' },
  ];

  return (
    <>
      {/* 1. Backdrop Overlay (Above page, Below Sidebar) */}
      <div 
        className={`fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[999] md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Mobile Sidebar (From Left) */}
      <nav 
        className={`fixed top-0 left-0 h-[100dvh] w-[280px] sm:w-[320px] bg-[#fefcf4] dark:bg-stone-950 z-[1000] shadow-2xl flex flex-col items-start transition-transform duration-300 ease-in-out transform md:hidden border-r border-stone-200/20 dark:border-stone-800/40 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-full flex flex-col h-full bg-[#fefcf4] dark:bg-stone-950">
          <div className="w-full px-6 py-[22px] border-b border-stone-200/20 dark:border-stone-800/40 flex justify-between items-center bg-[#fefcf4] dark:bg-stone-950">
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-headline font-black uppercase text-xl text-sky-500 italic"
            >
              Fazsee Store
            </Link>
            <button 
              className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-sky-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="w-full py-6 flex-1 overflow-y-auto">
            <div className="px-6 mb-4">
              <h4 className="font-label text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 tracking-[0.2em] mb-2">Menu Utama</h4>
              <div className="h-[2px] w-12 bg-sky-500/20 rounded-full"></div>
            </div>
            
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-6 py-4 font-label text-sm font-bold uppercase w-full transition-colors ${isActive('/') ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-r-4 border-sky-500' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900'}`}>
              <span className="material-symbols-outlined shrink-0 text-sky-500">home</span> Beranda
            </Link>
            <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-6 py-4 font-label text-sm font-bold uppercase w-full transition-colors ${isActive('/catalog') ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-r-4 border-sky-500' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900'}`}>
              <span className="material-symbols-outlined shrink-0 text-secondary-dim">storefront</span> Katalog Produk
            </Link>
            <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-6 py-4 font-label text-sm font-bold uppercase w-full transition-colors ${isActive('/orders') ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-r-4 border-sky-500' : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900'}`}>
              <span className="material-symbols-outlined shrink-0 text-primary">receipt_long</span> Riwayat Invoice
            </Link>

            <div className="px-6 mt-10 mb-4">
              <h4 className="font-label text-[10px] font-black uppercase text-stone-400 dark:text-stone-500 tracking-[0.2em] mb-2">Bantuan</h4>
              <div className="h-[2px] w-12 bg-green-500/20 rounded-full"></div>
            </div>
            <a href="https://wa.me/6283126165997" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-4 font-label text-sm font-bold uppercase w-full text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
              <span className="material-symbols-outlined shrink-0 text-green-500">chat</span> Hubungi Admin
            </a>
          </div>
          
          <div className="w-full mt-auto p-4 border-t border-stone-200/20 dark:border-stone-800/40 bg-stone-50/50 dark:bg-stone-900/30">
            {isAdmin && (
              <Link 
                to="/admin" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-4 rounded-2xl font-label text-[11px] font-black uppercase w-full bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-all mb-3 group"
              >
                <span className="material-symbols-outlined shrink-0 group-hover:rotate-12 transition-transform">shield_person</span> Dashboard Admin
              </Link>
            )}

            {!isLoggedIn ? (
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-stone-900 dark:bg-sky-500 text-white rounded-2xl font-label text-xs font-black uppercase hover:shadow-lg active:scale-95 transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-white text-lg">login</span> Login Member
              </Link>
            ) : (
              <Link 
                to="/profile" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-sky-500 text-white rounded-2xl font-label text-xs font-black uppercase hover:shadow-lg transiton-all mb-3"
              >
                 <span className="material-symbols-outlined text-white">person</span> Buka Profil
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 3. Main Sticky Header */}
      <header className="bg-[#fefcf4]/95 dark:bg-stone-950/95 backdrop-blur-md border-b-2 border-stone-200/20 dark:border-stone-800/40 shadow-[4px_4px_0px_0px_rgba(56,56,51,0.05)] dark:shadow-none sticky top-0 z-50 transition-colors duration-300 h-[72px] flex items-center">
        <div className="flex justify-between items-center w-full px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              className={`w-10 h-10 flex items-center justify-center text-sky-500 hover:scale-110 active:scale-90 transition-all duration-200 md:hidden ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-[28px]">menu</span>
            </button>
            <Link to="/" className="font-headline font-black uppercase tracking-tighter text-xl sm:text-2xl text-sky-500 italic drop-shadow-sm truncate max-w-[150px] sm:max-w-none">
              Fazsee Store
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`font-label text-sm font-bold uppercase hover:scale-105 transition-transform ${isActive(link.path) ? 'text-sky-600 dark:text-sky-400' : 'text-stone-600 dark:text-stone-400'}`}>
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="font-label text-sm font-bold uppercase text-error hover:scale-105 transition-transform flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span> Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px] pointer-events-none">search</span>
              <input 
                type="text" 
                placeholder="Cari..." 
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full py-2 pl-9 pr-4 text-xs font-label w-32 focus:w-48 transition-all focus:outline-none focus:border-sky-500 dark:text-stone-200 placeholder:text-stone-400"
              />
            </form>

            <DarkModeToggle />
            <button onClick={handleWishlistClick} className="text-sky-500 hover:scale-110 active:scale-90 transition-all duration-200 relative">
              <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </button>
            {isLoggedIn ? (
              <Link to="/profile" className="hidden md:flex items-center justify-center w-8 h-8 bg-sky-100 dark:bg-sky-900/50 rounded-full text-sky-600 dark:text-sky-400 ml-2 hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-sm">person</span>
              </Link>
            ) : (
              <Link to="/login" className="hidden md:block font-label text-xs font-bold uppercase bg-stone-900 dark:bg-sky-500 text-white px-5 py-2.5 rounded-full hover:scale-105 ml-2 transition-all shadow-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
