import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (path) => pathname === path;

  // Dinamis membaca status auth
  const isLoggedIn = !!localStorage.getItem('token');

  const navItems = [
    { path: '/', icon: 'home', label: 'Home' },
    { path: '/catalog', icon: 'grid_view', label: 'Semua Produk' },
    { path: '/orders', icon: 'receipt_long', label: 'Invoice' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-4 pt-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-t border-stone-200/50 dark:border-stone-800/50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-all duration-300">
      {navItems.map(({ path, icon, label }) => (
        <Link
          key={path}
          to={path}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-all duration-200 relative group ${
            isActive(path)
              ? 'text-primary dark:text-sky-400'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
        >
          {/* Active Highlight Indicator (Subtle Dot or Bar) */}
          {isActive(path) && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary dark:bg-sky-400 rounded-full shadow-[0_0_8px_rgba(0,180,216,0.6)]"></span>
          )}

          <span 
            className={`material-symbols-outlined text-[22px] transition-transform duration-200 group-active:scale-90 ${isActive(path) ? 'scale-110' : ''}`}
            style={isActive(path) ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {icon === 'person' && isLoggedIn && isActive(path) ? 'account_circle' : icon}
          </span>
          
          <span className={`font-label text-[9px] font-black uppercase mt-0.5 tracking-tighter transition-opacity ${isActive(path) ? 'opacity-100' : 'opacity-80'}`}>
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
