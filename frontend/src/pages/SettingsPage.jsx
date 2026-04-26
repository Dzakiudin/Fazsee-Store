import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { apiFetch } from '../services/apiService';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pengaturan'); // default tab
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '' // WhatsApp
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/auth/profile');
        if (data.success) {
          setProfile(data.data);
          const userData = data.data.user;
          setFormData({
            name: userData.name || '',
            username: userData.username || '',
            email: userData.email || '',
            phone: userData.whatsapp || ''
          });
        }
      } catch (err) {
        console.error('Failed to load profile for settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'transaksi') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const data = await apiFetch('/orders/history/me');
          if (data.success) {
            setOrders(data.data);
          }
        } catch (err) {
          console.error('Failed to load orders', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      const result = await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          whatsapp: formData.phone
        })
      });
      
      toast.success(result.message || 'Profil berhasil diperbarui!');
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, ...result.data }
      }));
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Konfirmasi kata sandi baru tidak cocok!');
    }
    
    if (passwordData.newPassword.length < 6) {
      return toast.error('Kata sandi baru minimal 6 karakter!');
    }

    setIsUpdatingPassword(true);
    
    try {
      const result = await apiFetch('/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      toast.success(result.message || 'Kata sandi berhasil diubah!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah kata sandi');
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  if (loading) {
    return (
      <main className="pt-8 pb-32 px-4 md:px-8 max-w-6xl mx-auto min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </main>
    );
  }

  const { user, role } = profile || {};
  const avatarSeed = user?.username || user?.name || user?.email || 'default';
  const displayName = user?.name || (role === 'admin' ? 'Administrator' : 'Pengguna');

  const menuItems = [
    { id: 'pengaturan', label: 'Pengaturan', icon: 'settings' },
    { id: 'transaksi', label: 'Riwayat Transaksi', icon: 'history' },
  ];

  return (
    <main className="pt-8 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Back to Profile Button */}
      <button onClick={() => navigate('/profile')} className="mb-6 flex items-center gap-2 font-label font-bold text-sm text-stone-500 hover:text-primary transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Kembali ke Profil
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Menu */}
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          <div className="bg-surface-container-lowest dark:bg-stone-900 rounded-2xl p-6 comic-shadow comic-ghost-border text-center">
            <div className="w-24 h-24 mx-auto bg-primary-container rounded-full overflow-hidden border-4 border-white dark:border-stone-800 shadow-md mb-4">
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`} alt="Avatar" className="w-full h-full object-cover p-2" />
            </div>
            <h2 className="font-headline font-black text-xl text-on-surface uppercase truncate">{displayName}</h2>
            <p className="font-body text-stone-500 font-medium text-sm mb-4">
              {user?.username ? `@${user.username}` : 'Member'}
            </p>
            <div className="inline-block bg-primary/20 text-primary font-label text-[10px] font-black uppercase px-3 py-1 rounded-full">
              {role === 'admin' ? 'Admin' : 'Verified Member'}
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-stone-900 rounded-2xl p-4 comic-shadow comic-ghost-border overflow-hidden">
            <nav className="flex flex-col space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label font-bold text-sm transition-all ${
                    activeTab === item.id 
                    ? 'bg-primary text-white comic-shadow scale-[1.02]' 
                    : 'text-stone-500 hover:bg-surface-container hover:text-stone-700 dark:hover:bg-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

          {/* Content Area */}
        <div className="w-full lg:w-3/4">

          {/* Pengaturan Tab */}
          {activeTab === 'pengaturan' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Edit Profil Section */}
              <section className="bg-surface-container-lowest dark:bg-stone-900 rounded-2xl p-6 md:p-8 comic-shadow comic-ghost-border">
                <div className="mb-6 pb-4 border-b-2 border-outline-variant/20 dark:border-stone-800">
                  <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-on-surface">Profil</h2>
                  <p className="font-body text-sm text-stone-500 font-medium mt-1">Informasi ini bersifat rahasia, jadi berhati-hatilah dengan apa yang Anda bagikan.</p>
                </div>
                
                <form className="space-y-5" onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 ml-1">Nama Anda</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container dark:bg-stone-800 border-2 border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 font-medium disabled:opacity-50" disabled={isUpdatingProfile} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 ml-1">Username</label>
                      <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-surface-container dark:bg-stone-800 border-2 border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 font-medium disabled:opacity-50" disabled={isUpdatingProfile} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 ml-1">Alamat Email</label>
                      <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-surface-container dark:bg-stone-800 border-2 border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 font-medium disabled:opacity-50" disabled={isUpdatingProfile} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1.5 ml-1">No. Handphone (WhatsApp)</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-container dark:bg-stone-800 border-2 border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 font-medium disabled:opacity-50" disabled={isUpdatingProfile} />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isUpdatingProfile} className="bg-primary hover:bg-sky-500 text-white px-8 py-3 rounded-full font-label font-bold text-sm uppercase transition-colors comic-shadow active:translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isUpdatingProfile ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : 'Ubah Profil'}
                    </button>
                  </div>
                </form>
              </section>

              {/* Ubah Kata Sandi Section */}
              <section className="bg-surface-container-lowest dark:bg-stone-900 rounded-2xl p-6 md:p-8 comic-shadow comic-ghost-border">
                <div className="mb-6 pb-4 border-b-2 border-outline-variant/20 dark:border-stone-800">
                  <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-on-surface">Ubah Kata Sandi</h2>
                  <p className="font-body text-sm text-stone-500 font-medium mt-1">Pastikan Anda mengingat kata sandi baru Anda sebelum mengubahnya.</p>
                </div>
                
                <form className="space-y-5" onSubmit={handlePasswordUpdate}>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">Kata Sandi Saat Ini</label>
                    <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} placeholder="••••••••" className="w-full bg-surface-container dark:bg-stone-800 border-2 border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 disabled:opacity-50" disabled={isUpdatingPassword} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">Kata Sandi Baru</label>
                    <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} placeholder="••••••••" className="w-full bg-surface-container dark:bg-stone-800 border-2 border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 disabled:opacity-50" disabled={isUpdatingPassword} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">Konfirmasi Kata Sandi Baru</label>
                    <input type="password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full bg-surface-container dark:bg-stone-800 border-2 border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 disabled:opacity-50" disabled={isUpdatingPassword} />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isUpdatingPassword} className="bg-primary hover:bg-sky-500 text-white px-8 py-3 rounded-full font-label font-bold text-sm uppercase transition-colors comic-shadow active:translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isUpdatingPassword ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> : 'Ubah Kata Sandi'}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* Transaksi Tab */}
          {activeTab === 'transaksi' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-surface-container-lowest dark:bg-stone-900 rounded-2xl p-6 md:p-8 comic-shadow comic-ghost-border">
                <div className="mb-6 pb-4 border-b-2 border-outline-variant/20 dark:border-stone-800">
                  <h2 className="font-headline font-black text-2xl uppercase tracking-widest text-on-surface">Riwayat Transaksi</h2>
                  <p className="font-body text-sm text-stone-500 font-medium mt-1">Daftar semua pembelian yang pernah Anda lakukan.</p>
                </div>

                {loadingOrders ? (
                  <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-stone-300 dark:text-stone-700 mb-4 block">sentiment_dissatisfied</span>
                    <h3 className="font-headline font-black text-xl text-stone-700 dark:text-stone-300 uppercase mb-2">Belum Ada Transaksi</h3>
                    <p className="text-stone-500 font-body">Anda belum melakukan pembelian apapun.</p>
                    <button onClick={() => navigate('/catalog')} className="mt-6 bg-primary text-white px-6 py-2 rounded-full font-label font-bold text-sm uppercase comic-shadow">Mulai Belanja</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-surface-container dark:bg-stone-800 rounded-xl p-4 md:p-5 border-2 border-transparent hover:border-primary transition-all group relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                          <div className="w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-label font-black text-xs px-2.5 py-1 bg-stone-200 dark:bg-stone-700 rounded-md text-stone-700 dark:text-stone-300 whitespace-nowrap">#{order.id}</span>
                              <span className="text-[10px] md:text-xs font-bold text-stone-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                            </div>
                            <h4 className="font-body font-bold text-base md:text-lg text-on-surface leading-tight">
                              {order.items?.length > 0 ? (order.items.length === 1 ? order.items[0].product.name : `${order.items[0].product.name} +${order.items.length - 1} barang`) : 'Item Tidak Tersedia'}
                            </h4>
                            <p className="text-xs text-stone-500 font-medium mt-1.5">Total: <span className="font-bold text-primary text-sm">Rp {order.totalPrice?.toLocaleString('id-ID')}</span></p>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t-2 md:border-t-0 border-stone-200/50 dark:border-stone-700/30">
                            <span className={`px-3 py-1.5 md:py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'DONE' ? 'bg-green-100 text-green-700' :
                              order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                              'bg-stone-200 text-stone-700'
                            }`}>
                              {order.status}
                            </span>
                            <button onClick={() => navigate(`/orders?orderId=${order.id}`)} className="text-primary hover:text-sky-500 bg-primary/10 hover:bg-primary/20 p-2 md:px-3 md:py-1.5 rounded-lg transition-colors flex items-center gap-1.5" title="Lihat Detail">
                              <span className="material-symbols-outlined text-[18px] md:text-[20px]">visibility</span>
                              <span className="font-label font-bold text-xs uppercase hidden md:inline-block">Detail</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}


        </div>
      </div>
    </main>
  );
}
