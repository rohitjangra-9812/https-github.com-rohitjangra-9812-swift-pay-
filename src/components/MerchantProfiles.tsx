import React, { useState } from 'react';
import { Store, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const MerchantProfiles = ({ 
  currentProfile, 
  onSelectProfile 
}: { 
  currentProfile: string, 
  onSelectProfile: (id: string) => void 
}) => {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('swiftpay_merchant_profiles');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'store_1', name: 'Main Store', role: 'Owner' },
      { id: 'store_2', name: 'Branch 2', role: 'Manager' }
    ];
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');

  const addProfile = () => {
    if (!newStoreName) return;
    const newProfile = { id: `store_${Date.now()}`, name: newStoreName, role: 'Owner' };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem('swiftpay_merchant_profiles', JSON.stringify(updated));
    setShowAdd(false);
    setNewStoreName('');
    toast.success('New store profile added!');
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-400" />
          Business Profiles
        </h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Store
        </button>
      </div>

      {showAdd && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-2">
          <h4 className="text-xs font-bold text-slate-300 mb-4">Add New Store Profile</h4>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Store Name" 
              value={newStoreName}
              onChange={e => setNewStoreName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={addProfile}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl transition-colors text-sm"
            >
              Add Profile
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {profiles.map((profile: any) => (
          <button
            key={profile.id}
            onClick={() => {
              onSelectProfile(profile.id);
              toast.success(`Switched to ${profile.name}`);
            }}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
              currentProfile === profile.id 
                ? 'bg-blue-900/20 border-blue-500/50' 
                : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentProfile === profile.id ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'
              }`}>
                <Store className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-white">{profile.name}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{profile.role}</p>
              </div>
            </div>
            {currentProfile === profile.id && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
          </button>
        ))}
      </div>
    </div>
  );
};
