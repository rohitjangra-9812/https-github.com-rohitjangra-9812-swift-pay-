import React, { useState } from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' }
];

export const LanguageSelector = ({ 
  currentLang, 
  onSelectLang 
}: { 
  currentLang: string, 
  onSelectLang: (lang: string) => void 
}) => {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Globe className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-bold text-white">App Language</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => {
              onSelectLang(lang.code);
              toast.success(`Language set to ${lang.name} (${lang.native})`);
            }}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
              currentLang === lang.code 
                ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] font-bold text-white">{lang.native}</span>
              <span className="text-[9px] uppercase tracking-wider">{lang.name}</span>
            </div>
            {currentLang === lang.code && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
          </button>
        ))}
      </div>
    </div>
  );
};
