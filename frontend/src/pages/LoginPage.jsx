import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();
  const toast = useToast();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isWaValid = /^08\d{8,11}$/.test(whatsapp);
  const isPasswordMatch = registerPassword.length > 0 && registerPassword === confirmPassword;

  const isLoginValid = email.trim() && password.length > 0;
  const isRegisterValid = fullName.trim() && username.trim() && isEmailValid && isWaValid && isPasswordMatch && acceptTerms;

  const isValid = isLogin ? !!isLoginValid : !!isRegisterValid;

  const handleValidationMessage = () => {
    if (isLogin) return '';
    if (email && !isEmailValid) return 'Format email tidak valid.';
    if (whatsapp && (!/^08/.test(whatsapp) || whatsapp.length < 10)) return 'Format WhatsApp tidak valid (awali 08).';
    if (confirmPassword && !isPasswordMatch) return 'Password tidak cocok.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const validationMsg = handleValidationMessage();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Proses Login
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Login gagal. Periksa email dan password Anda.');
        }

        localStorage.setItem('token', data.data.token);
        localStorage.setItem('role', data.data.role || 'user');
        toast.success('Berhasil login! Selamat datang kembali.');
        setTimeout(() => window.location.href = '/', 1000);
        
      } else {
        // Proses Register
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: registerPassword, name: fullName, username, whatsapp })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal membuat akun. Silakan coba lagi.');
        }

        toast.success('Pendaftaran berhasil! Silakan login.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setFormError(error.message || 'Terjadi kesalahan. Pastikan server berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-10 px-4 flex items-center justify-center bg-surface-container-highest dark:bg-stone-950 relative overflow-hidden font-body text-on-surface">
        <div className="w-full max-w-md bg-white dark:bg-stone-900 px-6 py-8 md:p-10 rounded-2xl border-2 border-stone-200/60 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 transition-all">
            
            {/* Header Titles */}
            <div className="mb-6">
                <Link to="/" className="inline-block hover:scale-105 transition-transform origin-left mb-6">
                   <h1 className="text-xl font-black text-sky-500 italic drop-shadow-sm uppercase tracking-tighter">&larr; FAZSEE STORE</h1>
                </Link>
                <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2 font-headline leading-tight">
                    {isLogin ? 'Masuk ke akun' : 'Buat akun baru'}
                </h2>
                <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">
                    {isLogin 
                        ? 'Masuk untuk melanjutkan pengalaman transaksimu.' 
                        : 'Daftar akun untuk mulai top up game & voucher favorit kamu.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {!isLogin && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Nama lengkap</label>
                            <input 
                                type="text" required value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-surface-container-lowest dark:bg-stone-800 border-2 border-outline-variant/30 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors text-on-surface dark:text-stone-100 font-medium placeholder:text-stone-400" 
                                placeholder="Windah Bocil" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Username</label>
                            <input 
                                type="text" required value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                className="w-full bg-surface-container-lowest dark:bg-stone-800 border-2 border-outline-variant/30 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors text-on-surface dark:text-stone-100 font-medium placeholder:text-stone-400" 
                                placeholder="windahbocil" 
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email</label>
                    <input 
                        type="email" required value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-container-lowest dark:bg-stone-800 border-2 border-outline-variant/30 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors text-on-surface dark:text-stone-100 font-medium placeholder:text-stone-400" 
                        placeholder={!isLogin ? "bocil@windah.com" : "email@fazseestore.id"} 
                    />
                </div>

                {!isLogin && (
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Nomor WhatsApp</label>
                        <input 
                            type="tel" required value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-surface-container-lowest dark:bg-stone-800 border-2 border-outline-variant/30 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors text-on-surface dark:text-stone-100 font-medium placeholder:text-stone-400" 
                            placeholder="08**********" 
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Password</label>
                    <input 
                        type={isLogin ? "password" : "password"} // Keep semantic mapping standard
                        required 
                        value={isLogin ? password : registerPassword}
                        onChange={(e) => isLogin ? setPassword(e.target.value) : setRegisterPassword(e.target.value)}
                        className="w-full bg-surface-container-lowest dark:bg-stone-800 border-2 border-outline-variant/30 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors text-on-surface dark:text-stone-100 font-medium placeholder:text-stone-400" 
                        placeholder="••••••••" 
                    />
                </div>

                {!isLogin && (
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Konfirmasi Password</label>
                        <input 
                            type="password" required value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-surface-container-lowest dark:bg-stone-800 border-2 border-outline-variant/30 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary dark:focus:border-sky-400 transition-colors text-on-surface dark:text-stone-100 font-medium placeholder:text-stone-400" 
                            placeholder="••••••••" 
                        />
                    </div>
                )}

                {/* Terms and Conditions Checkbox for Register */}
                {!isLogin && (
                    <div className="flex items-start gap-3 mt-2 pr-2">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 text-sky-500 border-stone-300 rounded focus:ring-sky-500 dark:border-stone-600 dark:bg-stone-700 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-sm font-medium text-stone-500 dark:text-stone-400 cursor-pointer">
                            Saya setuju dengan <a href="#" onClick={e => e.preventDefault()} className="text-sky-500 hover:underline">syarat & ketentuan</a>.
                        </label>
                    </div>
                )}

                {/* Validation Info (Form Level) */}
                {formError && (
                    <div className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-800/30">
                        {formError}
                    </div>
                )}
                {!formError && handleValidationMessage() && (
                    <div className="text-error dark:text-red-400 text-xs font-medium pl-1">
                        * {handleValidationMessage()}
                    </div>
                )}

                {/* Submit Action */}
                <button 
                    type="submit" 
                    disabled={loading || !isValid}
                    className="w-full bg-primary dark:bg-sky-500 hover:bg-sky-500 text-white font-bold tracking-wide py-3.5 rounded-3xl active:scale-95 transition-transform mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin p-0 m-0 leading-none">sync</span>
                    ) : (
                        isLogin ? 'Masuk sekarang' : 'Buat akun'
                    )}
                </button>
            </form>

            {/* Toggle Action */}
            <div className="mt-8 text-center pt-2">
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                    {isLogin ? "Belum punya akun?" : "Sudah punya akun?"} 
                    <button 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setFormError('');
                        }} 
                        className="ml-1.5 text-sky-600 dark:text-sky-400 font-bold hover:underline"
                    >
                        {isLogin ? 'Daftar disini' : 'Masuk sekarang'}
                    </button>
                </p>
            </div>
        </div>
    </main>
  );
}
