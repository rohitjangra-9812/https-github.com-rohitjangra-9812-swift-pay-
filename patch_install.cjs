const fs = require('fs');
let code = fs.readFileSync('src/components/InstallButton.tsx', 'utf-8');

code = `import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

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
        console.log(\`User response: \${outcome}\`);
        setDeferredPrompt(null);
        if (outcome === 'accepted') {
           setIsInstallable(false);
        }
      } catch (e) {
        console.error('Install prompt error:', e);
      }
    } else {
      if (isIOS) {
        toast.info("To install on iOS: tap the Share button at the bottom of Safari and select 'Add to Home Screen'.", { duration: 6000 });
      } else {
         toast.info("To install: tap the menu button in your browser and select 'Install app' or 'Add to Home Screen'.", { duration: 6000 });
      }
    }
  };

  if (!isInstallable) {
    return null;
  }

  return (
    <button 
      onClick={handleInstallClick}
      className="px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30"
      title="Install SwiftPay App"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Install App</span>
    </button>
  );
};

export default InstallButton;
`;
fs.writeFileSync('src/components/InstallButton.tsx', code);
