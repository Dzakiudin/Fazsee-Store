import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-high dark:bg-stone-900 pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 border-b border-outline-variant/20 dark:border-stone-800/50 pb-12">
        <div className="md:col-span-1">
          <h2 className="font-headline font-black text-3xl text-sky-500 italic mb-6 uppercase tracking-tighter">Fazsee Store</h2>
          <p className="text-on-surface-variant dark:text-stone-400 max-w-sm mb-8 leading-relaxed font-medium">
            Destinasi nomor satu untuk semua kebutuhan gaming kamu. Cepat, aman, dan terpercaya sejak 2024.
          </p>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full bg-surface-container-lowest dark:bg-stone-800 flex items-center justify-center text-primary-dim hover:bg-primary-container hover:text-white transition-all shadow-sm" href="https://wa.me/6283126165997">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-surface-container-lowest dark:bg-stone-800 flex items-center justify-center text-primary-dim hover:bg-primary-container hover:text-white transition-all shadow-sm" href="mailto:support@fajarstore.id">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </a>
          </div>
        </div>

        <div>
          <h6 className="font-headline font-black uppercase text-sm mb-6 text-on-surface dark:text-stone-100 italic">Developer Info</h6>
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">code</span>
                <span className="font-label font-bold text-xs text-on-surface dark:text-stone-300">Ahmad Dzakiudin</span>
             </div>
             <div className="flex gap-3 ml-1">
                <a href="https://github.com/Dzakiudin" target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors">
                   <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://www.instagram.com/jakijekiiii" target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-pink-500 transition-colors">
                   <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.247 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.247-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.247-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.247 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.facebook.com/jakijekijuki" target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-blue-600 transition-colors">
                   <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
             </div>
          </div>
        </div>

        <div>
          <h6 className="font-headline font-black uppercase text-sm mb-6 text-on-surface dark:text-stone-100 italic">Kontak Kami</h6>
          <ul className="space-y-4 text-on-surface-variant dark:text-stone-400 font-label text-sm font-medium">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">call</span>
              +62 831-2616-5997
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Jakarta, Indonesia
            </li>
          </ul>
        </div>

        <div>
          <h6 className="font-headline font-black uppercase text-sm mb-6 text-on-surface dark:text-stone-100 italic">Jam Operasional</h6>
          <ul className="space-y-4 text-on-surface-variant dark:text-stone-400 font-label text-sm font-medium">
            <li className="flex justify-between">
              <span>Setiap Hari</span>
              <span className="font-black text-on-surface dark:text-stone-100">24 JAM</span>
            </li>
            <li className="flex justify-between">
              <span>Admin Chat</span>
              <span className="font-black text-on-surface dark:text-stone-100">08:00 - 22:00</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-8 text-center text-on-surface-variant dark:text-stone-500 font-label text-[10px] font-black uppercase tracking-[0.2em]">
        © 2024 Fazsee Store. Develop by <a href="https://github.com/Dzakiudin" className="text-primary hover:underline">Ahmad Dzakiudin</a>.
      </div>
    </footer>
  );
}
