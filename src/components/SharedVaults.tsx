import React, { useState } from 'react';
import { Users, Plus, Target, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { toast } from 'sonner';

export const SharedVaults = () => {
  const [vaults, setVaults] = useState(() => {
    const saved = localStorage.getItem('swiftpay_vaults');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Goa Trip 2026', current: 15000, target: 40000, contributors: 4, myContribution: 5000 },
      { id: '2', name: 'New Apartment Deposit', current: 45000, target: 100000, contributors: 2, myContribution: 22500 }
    ];
  });
  
  const [showAdd, setShowAdd] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultTarget, setNewVaultTarget] = useState('');

  const createVault = () => {
    if (!newVaultName || !newVaultTarget) return;
    const newVault = {
      id: Date.now().toString(),
      name: newVaultName,
      target: Number(newVaultTarget),
      current: 0,
      contributors: 1,
      myContribution: 0
    };
    const updated = [...vaults, newVault];
    setVaults(updated);
    localStorage.setItem('swiftpay_vaults', JSON.stringify(updated));
    setShowAdd(false);
    setNewVaultName('');
    setNewVaultTarget('');
    toast.success('New shared vault created!');
  };

  const contribute = (id: string) => {
    const amount = Number(window.prompt("Enter amount to contribute:"));
    if (amount > 0) {
      const updated = vaults.map((v: any) => {
        if (v.id === id) {
          return {
            ...v,
            current: v.current + amount,
            myContribution: v.myContribution + amount
          };
        }
        return v;
      });
      setVaults(updated);
      localStorage.setItem('swiftpay_vaults', JSON.stringify(updated));
      toast.success(`Successfully contributed ${formatCurrency(amount)}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          Group Vaults
        </h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs font-bold text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-purple-400/20 transition-colors"
        >
          <Plus className="w-3 h-3" /> New Vault
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-2">
          <h4 className="text-xs font-bold text-slate-300 mb-4">Create Shared Vault</h4>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Vault Name (e.g. Vacation)" 
              value={newVaultName}
              onChange={e => setNewVaultName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <input 
              type="number" 
              placeholder="Target Amount" 
              value={newVaultTarget}
              onChange={e => setNewVaultTarget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <button 
              onClick={createVault}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl transition-colors text-sm"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {vaults.map((vault: any) => {
        const progress = Math.min((vault.current / vault.target) * 100, 100);
        return (
          <div key={vault.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-white text-sm">{vault.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{vault.contributors} contributors</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Target</p>
                <p className="text-sm font-bold text-slate-300">{formatCurrency(vault.target)}</p>
              </div>
            </div>

            <div className="mb-2 flex justify-between items-end">
              <div>
                <p className="text-2xl font-black text-white">{formatCurrency(vault.current)}</p>
                <p className="text-[10px] text-emerald-400">You added {formatCurrency(vault.myContribution)}</p>
              </div>
              <button 
                onClick={() => contribute(vault.id)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Contribute
              </button>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-purple-500 transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
