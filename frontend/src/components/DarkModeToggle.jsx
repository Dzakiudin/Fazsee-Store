import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="w-10 h-10 rounded-full bg-surface-container-high dark:bg-stone-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
      aria-label="Toggle dark mode"
    >
      <span className="material-symbols-outlined text-xl text-on-surface-variant dark:text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
