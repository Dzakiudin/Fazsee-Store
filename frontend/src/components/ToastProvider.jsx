import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warn: (msg) => addToast(msg, 'warn'),
  };

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warn: 'warning',
  };

  const colorMap = {
    success: 'bg-emerald-50 dark:bg-stone-900 border-2 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    error: 'bg-red-50 dark:bg-stone-900 border-2 border-red-500/20 text-red-600 dark:text-red-400',
    info: 'bg-sky-50 dark:bg-stone-900 border-2 border-sky-500/20 text-sky-600 dark:text-sky-400',
    warn: 'bg-orange-50 dark:bg-stone-900 border-2 border-orange-500/20 text-orange-600 dark:text-orange-400',
  };

  const progressColorMap = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-sky-500',
    warn: 'bg-orange-500',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${colorMap[t.type]} rounded-2xl shadow-xl shadow-stone-900/5 pointer-events-auto animate-slide-in overflow-hidden backdrop-blur-md relative`}
          >
            <div className="px-5 py-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                {iconMap[t.type]}
              </span>
              <p className="flex-1 font-body font-bold text-sm text-stone-700 dark:text-stone-300">
                {t.message}
              </p>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-stone-200/50 dark:bg-stone-800 absolute bottom-0 left-0">
              <div 
                className={`h-full ${progressColorMap[t.type]} animate-toast-progress`} 
                style={{ animationDuration: `${t.duration}ms` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
