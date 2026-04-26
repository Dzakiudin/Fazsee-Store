import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { apiFetch, apiFetcher } from '../../services/apiService';

export default function AdminChatModal({ orderId, orderStatus, onClose }) {
  const [chatMessage, setChatMessage] = useState('');
  const bottomRef = useRef(null);

  const isChatActive = !['COMPLETED', 'FAILED'].includes(orderStatus);

  const { data: messages = [], mutate: mutateMessages } = useSWR(
    orderId ? `/orders/${orderId}/chat` : null,
    apiFetcher,
    { refreshInterval: isChatActive ? 3000 : 0 }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !isChatActive) return;
    try {
      await apiFetch(`/orders/${orderId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ content: chatMessage, sender: 'admin' })
      });
      setChatMessage('');
      mutateMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[500px]">
        
        <div className="flex justify-between items-center p-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h3 className="font-headline font-black text-lg text-on-surface dark:text-stone-100 uppercase">
              Chat #{orderId}
            </h3>
            {!isChatActive && (
              <p className="text-[10px] text-stone-400 font-label font-bold uppercase">Sesi chat berakhir</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50 md:bg-transparent dark:bg-stone-900/50">
          {messages.length === 0 ? (
            <p className="text-center text-xs text-stone-400 italic mt-10">Belum ada obrolan.</p>
          ) : (
            messages.map(msg => {
              const isAdmin = msg.sender === 'admin';
              return (
                <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isAdmin ? 'bg-primary text-white rounded-br-none' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-bl-none'}`}>
                    <p>{msg.content}</p>
                    <p className={`text-[9px] mt-1 text-right ${isAdmin ? 'text-white/50' : 'text-stone-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {isChatActive ? (
          <form onSubmit={handleSendChat} className="p-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex gap-2">
            <input
              type="text"
              placeholder="Balas pesan..."
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              className="flex-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full px-4 py-2 focus:outline-none focus:border-primary text-sm font-body text-stone-700 dark:text-stone-200"
            />
            <button type="submit" disabled={!chatMessage.trim()} className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-transform">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        ) : (
          <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 text-center">
            <p className="text-xs text-stone-500 font-label font-bold uppercase">Chat berakhir — order {orderStatus === 'COMPLETED' ? 'selesai' : 'gagal'}</p>
          </div>
        )}

      </div>
    </div>
  );
}
