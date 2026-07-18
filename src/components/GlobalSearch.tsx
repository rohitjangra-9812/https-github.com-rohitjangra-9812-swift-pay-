import React, { useState, useEffect } from 'react';
import { Search, X, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export const GlobalSearch = ({ onResultClick, onAdminAccess }: { onResultClick?: (tx: any) => void, onAdminAccess?: () => void }) => {
  const [query, setQuery] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('swiftpay_history');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTransactions(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setTransactions([]);
        }
      }
    };
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filtered = query.trim() === "" ? [] : transactions.filter(tx => {
    if (!tx) return false;
    const searchLower = query.toLowerCase();
    const recipientMatch = String(tx.recipient || tx.merchant || "").toLowerCase().includes(searchLower);
    const noteMatch = String(tx.note || tx.details || "").toLowerCase().includes(searchLower);
    const dateStr = formatDate(tx.timestamp || tx.date || Date.now()).toLowerCase();
    const dateMatch = dateStr.includes(searchLower);

    return recipientMatch || noteMatch || dateMatch;
  });

  return (
    <div className="relative z-40 mb-6">
      <div className={`flex items-center bg-slate-900 border ${isFocused ? 'border-indigo-500' : 'border-slate-800'} rounded-2xl px-4 py-3 transition-colors shadow-sm`}>
        <Search className="w-5 h-5 text-slate-400 mr-3" />
        <input 
          type="text"
          placeholder="Search recipient, note, or date..."
          className="bg-transparent border-none outline-none text-white flex-1 text-sm font-medium w-full"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (val === "#ADMIN" && onAdminAccess) {
              setQuery("");
              onAdminAccess();
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {query.trim() !== "" && (
          <button onClick={() => setQuery("")} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {query.trim() !== "" && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200">
          {filtered.length > 0 ? (
            <div className="p-2 space-y-1">
              {filtered.map((tx, idx) => (
                <button 
                  key={idx}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors text-left"
                  onClick={() => {
                     setQuery("");
                     if (onResultClick) onResultClick(tx);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'received' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {tx.type === 'received' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{tx.recipient || tx.merchant || "Transaction"}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(tx.timestamp || tx.date || Date.now())}</span>
                        {tx.note && <span>• {tx.note}</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${tx.type === 'received' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'received' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
              No transactions found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
