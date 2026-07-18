import React, { useState } from 'react';
import { Calculator, ArrowRight, Percent, Building2 } from 'lucide-react';

export const TaxCalculator = () => {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState<number>(18);
  const [isInclusive, setIsInclusive] = useState(false);

  const calculateTax = () => {
    const base = Number(amount) || 0;
    if (base === 0) return { net: 0, tax: 0, total: 0, cgst: 0, sgst: 0 };

    if (isInclusive) {
      const net = base / (1 + gstRate / 100);
      const tax = base - net;
      return {
        net,
        tax,
        total: base,
        cgst: tax / 2,
        sgst: tax / 2
      };
    } else {
      const tax = base * (gstRate / 100);
      return {
        net: base,
        tax,
        total: base + tax,
        cgst: tax / 2,
        sgst: tax / 2
      };
    }
  };

  const results = calculateTax();

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Calculator className="w-24 h-24" />
        </div>
        
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          GST Calculator
        </h3>
        <p className="text-xs text-slate-400 mb-6">Calculate tax implications for your business transactions</p>

        <div className="space-y-4 relative z-10">
          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Amount (₹)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-medium"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">GST Rate</label>
            <div className="flex gap-2">
              {[5, 12, 18, 28].map(rate => (
                <button
                  key={rate}
                  onClick={() => setGstRate(rate)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                    gstRate === rate 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">Calculation Type</label>
            <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setIsInclusive(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                  !isInclusive ? 'bg-slate-800 text-white' : 'text-slate-500'
                }`}
              >
                Exclusive (Add GST)
              </button>
              <button
                onClick={() => setIsInclusive(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                  isInclusive ? 'bg-slate-800 text-white' : 'text-slate-500'
                }`}
              >
                Inclusive (Remove GST)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-5">
        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-4">Calculation Results</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Net Amount</span>
            <span className="text-sm font-medium text-white">₹{results.net.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs">CGST ({gstRate/2}%)</span>
            <span className="text-xs">₹{results.cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs">SGST ({gstRate/2}%)</span>
            <span className="text-xs">₹{results.sgst.toFixed(2)}</span>
          </div>
          <div className="h-px bg-slate-800 my-2"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white">Total Amount</span>
            <span className="text-lg font-black text-emerald-400">₹{results.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
