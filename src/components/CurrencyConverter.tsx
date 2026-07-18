import React, { useState } from 'react';
import { X, ArrowRightLeft, Globe } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const MOCK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  SGD: 0.016,
};

const CURRENCIES = Object.keys(MOCK_RATES);

export const CurrencyConverter = ({ onClose }: { onClose: () => void }) => {
  const [amount, setAmount] = useState<string>("1000");
  const [from, setFrom] = useState<string>("INR");
  const [to, setTo] = useState<string>("USD");

  const convert = (amt: number, fromCurr: string, toCurr: string) => {
    const inINR = amt / MOCK_RATES[fromCurr];
    return inINR * MOCK_RATES[toCurr];
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const convertedAmount = amount ? convert(parseFloat(amount), from, to) : 0;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
            <Globe className="w-5 h-5 text-indigo-400" />
            Currency Converter
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Amount to convert</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-2xl font-black text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">From</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-indigo-500 appearance-none"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <button 
              onClick={handleSwap}
              className="w-10 h-10 mt-6 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors shrink-0 text-white"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-indigo-500 appearance-none"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-center">
            <p className="text-sm font-medium text-indigo-300 mb-1">Converted Amount</p>
            <h3 className="text-3xl font-black text-white">
              {formatCurrency(convertedAmount, to)}
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              1 {from} = {formatCurrency(convert(1, from, to), to)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
