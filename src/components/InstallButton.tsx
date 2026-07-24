import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { toast } from 'sonner';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstallable(false);
      return;
    }
    
    setIsInstallable(true); // Always show button, handle fallback on click

    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleCustomPrompt = (e: any) => {
      setDeferredPrompt(e.detail);
    };
    window.addEventListener('appinstalledprompt', handleCustomPrompt);

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalledprompt', handleCustomPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        setDeferredPrompt(null);
        if (outcome === 'accepted') {
           setIsInstallable(false);
        }
      } catch (e) {
        console.error('Install prompt error:', e);
      }
    } else {
      setShowInstructions(true);
    }
  };

  if (!isInstallable) {
    return null;
  }

  return (
    <>
      <button 
        onClick={handleInstallClick}
        className="px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30"
        title="Install SwiftPay App"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showInstructions && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-slate-950/80 backdrop-blur-sm p-4 pb-8 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300 relative">
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-200 dark:border-indigo-500/20">
              <Download className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Install SwiftPay</h3>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
              Install this app on your device for quick and easy access.
            </p>

            {isIOS ? (
              <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">1</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                    Tap the <Share className="w-4 h-4 inline mx-1 text-blue-500" /> <strong>Share</strong> button at the bottom of Safari.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">2</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                    Scroll down and tap <PlusSquare className="w-4 h-4 inline mx-1 text-slate-500" /> <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">1</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                    Tap the browser menu <strong>(⋮)</strong> in the top right corner.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">2</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                    Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </p>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallButton;
