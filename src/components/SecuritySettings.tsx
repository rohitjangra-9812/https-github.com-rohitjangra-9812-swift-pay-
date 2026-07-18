import React, { useState, useEffect } from 'react';
import { X, Shield, Clock } from 'lucide-react';

export const SecuritySettings = ({ onClose }: { onClose: () => void }) => {
  const [timeout, setTimeoutVal] = useState<number>(() => {
    const saved = localStorage.getItem('swiftpay_autolock_timeout');
    return saved ? parseInt(saved) : 0; // 0 means disabled
  });

  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('swiftpay_high_value_threshold');
    return saved ? parseInt(saved) : 10000;
  });

  const handleSaveTimeout = (val: number) => {
    setTimeoutVal(val);
    localStorage.setItem('swiftpay_autolock_timeout', val.toString());
    // Dispatch an event so App.tsx can update its timer
    window.dispatchEvent(new CustomEvent('autolock_changed', { detail: val }));
  };

  const handleSaveThreshold = (val: string) => {
    const num = parseInt(val);
    if (!isNaN(num)) {
      setThreshold(num);
      localStorage.setItem('swiftpay_high_value_threshold', num.toString());
      window.dispatchEvent(new CustomEvent('high_value_threshold_changed', { detail: num }));
    } else if (val === '') {
      setThreshold(0);
      localStorage.setItem('swiftpay_high_value_threshold', '0');
      window.dispatchEvent(new CustomEvent('high_value_threshold_changed', { detail: 0 }));
    }
  };

  const options = [
    { label: "Immediately", value: 1 },
    { label: "1 minute", value: 60000 },
    { label: "5 minutes", value: 300000 },
    { label: "10 minutes", value: 600000 },
    { label: "Never", value: 0 },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
            <Shield className="w-5 h-5 text-indigo-400" />
            Security Settings
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
              <Clock className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Auto-Lock</h3>
              <p className="text-xs text-slate-400">Lock the app after inactivity.</p>
            </div>
          </div>

          <div className="space-y-2">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSaveTimeout(opt.value)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                  timeout === opt.value 
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold" 
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                }`}
              >
                <span>{opt.label}</span>
                {timeout === opt.value && (
                  <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Alert Threshold</h3>
              <p className="text-xs text-slate-400">Notify me for high-value transactions.</p>
            </div>
          </div>
          
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Threshold Amount (₹)
            </label>
            <input 
              type="number" 
              value={threshold || ''} 
              onChange={(e) => handleSaveThreshold(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full bg-transparent text-white font-bold text-xl outline-none"
            />
          </div>

          <button 
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('Notifications Enabled', {
                      body: 'You will now receive alerts for high-value transactions.',
                      icon: '/icon-192.png'
                    });
                  }
                });
              }
            }}
            className="w-full flex items-center justify-between p-4 rounded-xl border bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700 transition-all"
          >
            <span>Enable System Push Notifications</span>
            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
          </button>
        </div>
      </div>
    </div>
  );
};
