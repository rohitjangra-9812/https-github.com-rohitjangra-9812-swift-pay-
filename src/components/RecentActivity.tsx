import { formatCurrency } from '../utils/formatCurrency';
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Smartphone, Building2, XCircle, Info, Hash, RefreshCcw } from 'lucide-react';

export const RecentActivity = ({ onShowAll, onRepeatPayment }: { onShowAll: () => void, onRepeatPayment?: (tx: any) => void }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  useEffect(() => {
    const loadHistory = () => {
      const saved = localStorage.getItem('swiftpay_history');
      if (saved) {
        setHistory(JSON.parse(saved).slice(0, 5));
      }
    };
    
    loadHistory();
    window.addEventListener('storage', loadHistory);
    window.addEventListener('swiftpay_history_updated', loadHistory);
    
    return () => {
      window.removeEventListener('storage', loadHistory);
      window.removeEventListener('swiftpay_history_updated', loadHistory);
    };
  }, []);

  if (history.length === 0) {
    return null;
  }

  const getIcon = (type: string, method: string) => {
    if (type === 'received') return <ArrowDownRight className="w-5 h-5 text-emerald-400" />;
    if (method === 'Mobile') return <Smartphone className="w-5 h-5 text-indigo-400" />;
    if (method === 'Bank Transfer') return <Building2 className="w-5 h-5 text-indigo-400" />;
    return <ArrowUpRight className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <>
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Recent Activity
          </h3>
          <button onClick={onShowAll} className="text-[10px] text-indigo-400 font-bold uppercase hover:text-indigo-300">
            View All
          </button>
        </div>
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-4">
          {history.map((tx, idx) => (
            <button 
              key={idx} 
              onClick={() => setSelectedTx(tx)}
              className="w-full flex items-center justify-between hover:bg-slate-800/50 p-2 -mx-2 rounded-2xl transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'received' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
                  {getIcon(tx.type, tx.method)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-white truncate">{tx.recipient || tx.sender || 'Unknown'}</p>
                  <p className="text-xs text-slate-400 truncate">{new Date(tx.date).toLocaleDateString()} • {tx.method}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold ${tx.type === 'received' ? 'text-emerald-400' : 'text-white'}`}>
                  {tx.type === 'received' ? '+' : '-'}{formatCurrency(tx.amount).replace('₹', '')}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">{tx.status || 'Successful'}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Transaction Modal Slide-over */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedTx(null)}></div>
          <div className="relative w-full max-w-sm h-full bg-slate-950 border-l border-slate-800 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" />
                Transaction Details
              </h3>
              <button 
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${selectedTx.type === 'received' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'}`}>
                   {getIcon(selectedTx.type, selectedTx.method)}
                </div>
                <h4 className="text-3xl font-black text-white mb-1">
                  {selectedTx.type === 'received' ? '+' : '-'}{formatCurrency(selectedTx.amount)}
                </h4>
                <p className="text-sm font-medium text-slate-400 capitalize flex items-center justify-center gap-1">
                  {selectedTx.status || 'Successful'} • {new Date(selectedTx.date).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">
                    {selectedTx.type === 'received' ? 'From' : 'To'}
                  </p>
                  <p className="font-bold text-white text-sm">{selectedTx.recipient || selectedTx.sender || 'Unknown'}</p>
                  {selectedTx.upiId && <p className="text-xs text-slate-400">{selectedTx.upiId}</p>}
                </div>

                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Payment Method</p>
                  <p className="font-bold text-white text-sm">{selectedTx.method}</p>
                </div>

                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Transaction ID</p>
                    <p className="font-mono text-white text-sm font-bold flex items-center gap-1">
                      <Hash className="w-3 h-3 text-indigo-400" />
                      {selectedTx.id || `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`}
                    </p>
                  </div>
                </div>

                {selectedTx.note && (
                  <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Note</p>
                    <p className="text-white text-sm italic">"{selectedTx.note}"</p>
                  </div>
                )}
              </div>
            </div>
            {selectedTx.type === 'sent' && onRepeatPayment && (
              <div className="p-6 border-t border-slate-800">
                <button
                  onClick={() => {
                    onRepeatPayment(selectedTx);
                    setSelectedTx(null);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Repeat Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
