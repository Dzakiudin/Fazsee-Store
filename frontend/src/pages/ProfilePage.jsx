import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    apiFetch('/auth/profile')
      .then(data => setProfile(data.data))
      .catch(err => {
        setError(err.message);
        if (err.message === 'Unauthorized' || err.message.includes('token')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  if (loading) {
    return (
    <main className="pt-8 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="pt-8 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Memuat Profil</h2>
        <p className="text-stone-500 mb-6">{error}</p>
        <button onClick={handleLogout} className="bg-primary text-white px-6 py-2 rounded-full font-bold">Kembali ke Login</button>
      </main>
    );
  }

  const { user, role } = profile;
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }) : 'N/A';
  const avatarSeed = user.username || user.name || user.email;
  const displayName = user.name || (role === 'admin' ? 'Administrator' : 'Pengguna');

  return (
    <main className="pt-8 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Profil Header */}
      <section className="bg-surface-container-lowest dark:bg-stone-900 rounded-3xl p-8 comic-shadow comic-ghost-border flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
        
        <div className="w-32 h-32 md:w-40 md:h-40 bg-primary-container rounded-full overflow-hidden border-4 border-white dark:border-stone-800 shadow-xl z-10 flex-shrink-0">
          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`} alt="Avatar" className="w-full h-full object-cover p-2" />
        </div>
        
        <div className="text-center md:text-left z-10 space-y-2 w-full">
          <div className="inline-block bg-primary/20 text-primary font-label text-[10px] font-black uppercase px-3 py-1 rounded-full mb-2">
            {role === 'admin' ? 'Admin' : 'Verified Member'}
          </div>
          <h1 className="font-headline font-black text-3xl md:text-4xl text-on-surface dark:text-stone-100 uppercase italic truncate">
            {displayName}
          </h1>
          <p className="font-body text-stone-500 font-medium">
            {user.username ? `@${user.username}` : 'Member'} • Bergabung: {joinDate}
          </p>
          
          <div className="flex gap-4 pt-4 justify-center md:justify-start">
            <button onClick={() => navigate('/settings')} className="bg-primary hover:bg-sky-500 text-white px-6 py-2.5 rounded-full font-label font-bold text-sm uppercase transition-colors comic-outline flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profil
            </button>
            <button onClick={handleLogout} className="bg-surface-container-high hover:bg-error hover:text-white dark:bg-stone-800 dark:hover:bg-error px-6 py-2.5 text-on-surface rounded-full font-label font-bold text-sm uppercase transition-colors comic-outline flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">logout</span> Logout
            </button>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => navigate('/settings')} className="bg-white dark:bg-stone-900 border-2 border-outline-variant/20 dark:border-stone-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary transition-all group">
          <span className="material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform">settings</span>
          <span className="font-label text-xs font-bold text-stone-600 dark:text-stone-400 uppercase">Pengaturan</span>
        </button>
        <button onClick={() => navigate('/orders')} className="bg-white dark:bg-stone-900 border-2 border-outline-variant/20 dark:border-stone-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary transition-all group">
          <span className="material-symbols-outlined text-2xl text-sky-500 group-hover:scale-110 transition-transform">receipt_long</span>
          <span className="font-label text-xs font-bold text-stone-600 dark:text-stone-400 uppercase">Cek Invoice</span>
        </button>
        <button onClick={() => navigate('/wishlist')} className="bg-white dark:bg-stone-900 border-2 border-outline-variant/20 dark:border-stone-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary transition-all group">
          <span className="material-symbols-outlined text-2xl text-red-400 group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <span className="font-label text-xs font-bold text-stone-600 dark:text-stone-400 uppercase">Game Favorit</span>
        </button>
        <button onClick={() => navigate('/catalog')} className="bg-white dark:bg-stone-900 border-2 border-outline-variant/20 dark:border-stone-800 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary transition-all group">
          <span className="material-symbols-outlined text-2xl text-emerald-500 group-hover:scale-110 transition-transform">sports_esports</span>
          <span className="font-label text-xs font-bold text-stone-600 dark:text-stone-400 uppercase">Top Up</span>
        </button>
      </section>

    </main>
  );
}
