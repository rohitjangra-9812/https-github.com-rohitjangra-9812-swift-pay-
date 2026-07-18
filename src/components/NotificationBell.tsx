import React, { useState, useEffect, useRef } from 'react';
import { Bell, ShieldAlert, Key, Fingerprint, LogIn, CheckCircle2, ArrowUpRight, XCircle } from 'lucide-react';
import { getSecurityLogs, SecurityLog } from '../utils/securityLogs';
import { formatDate } from '../utils/formatDate';

export const NotificationBell = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadLogs = () => {
    const fetchedLogs = getSecurityLogs();
    setLogs(fetchedLogs.slice(0, 10)); // Just show recent 10 logs

    const lastRead = parseInt(localStorage.getItem('swiftpay_last_read_log') || '0', 10);
    const unread = fetchedLogs.filter(log => log.timestamp > lastRead).length;
    setUnreadCount(unread);
  };

  useEffect(() => {
    loadLogs();
    window.addEventListener('security_log_added', loadLogs);
    return () => window.removeEventListener('security_log_added', loadLogs);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      if (logs.length > 0) {
        localStorage.setItem('swiftpay_last_read_log', logs[0].timestamp.toString());
        setUnreadCount(0);
      }
    }
    setIsOpen(!isOpen);
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'LOGIN_SUCCESS': return <LogIn className="w-4 h-4 text-emerald-400" />;
      case 'PIN_FAILED': return <Key className="w-4 h-4 text-rose-400" />;
      case 'BIOMETRIC_FAILED': return <Fingerprint className="w-4 h-4 text-rose-400" />;
      case 'TRANSACTION_SUCCESS': return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
      case 'TRANSACTION_FAILED': return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'SECURITY_ALERT': return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      default: return <ShieldAlert className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3">
                    <div className="mt-1 flex-shrink-0 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                      {getLogIcon(log.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{log.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(new Date(log.timestamp))}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
