import React, { useState } from 'react';
import { Palette, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ThemeSelector = ({ 
  currentTheme, 
  onSelectTheme 
}: { 
  currentTheme: string, 
  onSelectTheme: (theme: string) => void 
}) => {
  const themes = [
    { id: 'slate', name: 'Midnight Slate', color: 'bg-slate-900', border: 'border-slate-800' },
    { id: 'indigo', name: 'Deep Indigo', color: 'bg-indigo-950', border: 'border-indigo-900' },
    { id: 'emerald', name: 'Emerald Forest', color: 'bg-emerald-950', border: 'border-emerald-900' },
    { id: 'rose', name: 'Crimson Rose', color: 'bg-rose-950', border: 'border-rose-900' },
    { id: 'cyan', name: 'Ocean Cyan', color: 'bg-cyan-950', border: 'border-cyan-900' },
  ];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Palette className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-bold text-white">App Personalization</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => {
              onSelectTheme(theme.id);
              toast.success(`Theme changed to ${theme.name}`);
            }}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${theme.color} ${theme.border} ${
              currentTheme === theme.id ? 'ring-2 ring-white/50 scale-105' : 'hover:scale-105 opacity-80'
            }`}
          >
            <div className={`w-8 h-8 rounded-full mb-2 ${theme.color} border-2 border-white/10 flex items-center justify-center`}>
              {currentTheme === theme.id && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <span className="text-[10px] font-bold text-white tracking-wider">{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
