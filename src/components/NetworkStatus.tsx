import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { toast } from 'sonner';

export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored. Data is syncing...", {
        icon: <Wifi className="w-5 h-5 text-emerald-500" />
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Network connection lost. Trying to reconnect...", {
        duration: Infinity,
        id: "offline-toast",
        icon: <WifiOff className="w-5 h-5 text-red-500 animate-pulse" />
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      toast.dismiss("offline-toast");
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-full duration-300 shadow-lg">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Working Offline. Waiting for connection...</span>
    </div>
  );
};
