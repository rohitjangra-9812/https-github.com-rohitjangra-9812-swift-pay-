import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, Key, Fingerprint, LogIn } from 'lucide-react';
import { SecurityLog, getSecurityLogs } from '../utils/securityLogs';

export const SecurityLogs = ({ onBack }: { onBack: () => void }) => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);

  useEffect(() => {
    setLogs(getSecurityLogs());
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'PIN_FAILED': return <Key className="w-4 h-4 text-rose-400" />;
      case 'BIOMETRIC_FAILED': return <Fingerprint className="w-4 h-4 text-rose-400" />;
      case 'LOGIN_SUCCESS': return <LogIn className="w-4 h-4 text-emerald-400" />;
      default: return <ShieldAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'PIN_FAILED':
      case 'BIOMETRIC_FAILED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'LOGIN_SUCCESS': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500">
      {/* Header */}
      <div className="bg-slate-900/40 p-6 rounded-b-3xl border-b border-slate-800/50 relative overflow-hidden">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-8 h-8 bg-slate-800/50 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors z-20"
        >
          <ArrowLeft className="w-4 h-4 text-slate-300" />
        </button>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
        
        <div className="flex flex-col items-center mt-2">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 mb-3 shadow-inner">
            <ShieldAlert className="w-6 h-6 text-slate-300" />
          </div>
          <h1 className="text-xl font-bold text-white relative z-10">
            Security Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit trail for authentication events</p>
        </div>
      </div>

      <div className="p-5 overflow-y-auto h-[calc(100vh-220px)] space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-10">
            <ShieldAlert className="w-12 h-12 text-slate-800 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No security events logged yet.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex gap-4 items-start">
              <div className={`mt-1 p-2 rounded-full border ${getBadgeColor(log.type)}`}>
                {getIcon(log.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold text-slate-200">{log.message}</h4>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${getBadgeColor(log.type)}`}>
                    {log.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
