import { ThemeToggle } from "./components/ThemeToggle";
import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';

import { RazorpayGateway } from './components/RazorpayGateway';
import { MockAdminDashboard } from './components/MockAdminDashboard';
import { PinGate } from './components/PinGate';
import { BiometricModal } from './components/BiometricModal';
import { GatewayInterface } from './components/GatewayInterface';
import { SwiftPayGateway } from './components/SwiftPayGateway';
import InstallButton from './components/InstallButton';
import { UserPanel } from './components/UserPanel';
import { BankAccountSetup } from './components/BankAccountSetup';
import { ShieldCheck, User, Share2, Grid, Lock, CreditCard, Fingerprint, HelpCircle, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { NetworkStatus } from './components/NetworkStatus';
import { QuickHelpModal } from './components/QuickHelpModal';
import { PinResetFlow } from './components/PinResetFlow';
import { NotificationBell } from './components/NotificationBell';
import { logSecurityEvent } from './utils/securityLogs';
import { startPeriodicSync, syncBankAccountState } from './utils/backupSync';

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'panel';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBankLinked, setIsBankLinked] = useState(() => localStorage.getItem("swiftpay_isBankLinked") === "true");
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentPage === 'panel') {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', currentPage);
    }
    window.history.replaceState({}, '', url.toString());
  }, [currentPage]);

  useEffect(() => {
    const cleanup = startPeriodicSync();
    return cleanup;
  }, []);

  // Auto-lock logic
  useEffect(() => {
    const handleTriggerAdmin = () => {
      setCurrentPage('admin');
      toast.success("Developer Mode Unlocked");
    };
    document.addEventListener("trigger_admin", handleTriggerAdmin);
    return () => document.removeEventListener("trigger_admin", handleTriggerAdmin);
  }, []);

  useEffect(() => {
    let timeoutId: any = null;
    let warningTimeoutId: any = null;
    let currentTimeout = parseInt(localStorage.getItem('swiftpay_autolock_timeout') || '0');

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (currentTimeout > 0 && isAppUnlocked) {
        setSessionExpiry(Date.now() + currentTimeout);
        timeoutId = setTimeout(() => {
          setIsAppUnlocked(false);
          setSessionExpiry(null);
        }, currentTimeout);
        
        if (currentTimeout > 30000) {
          warningTimeoutId = setTimeout(() => {
            toast.warning("Your session will expire in 30 seconds. Move your mouse or tap to stay logged in.", {
              duration: 10000,
              id: 'session-warning'
            });
          }, currentTimeout - 30000);
        }
      } else {
        setSessionExpiry(null);
      }
    };

    const handleTimeoutChange = (e: any) => {
      currentTimeout = e.detail;
      resetTimer();
    };

    const handleActivity = () => {
      resetTimer();
    };

    window.addEventListener('autolock_changed', handleTimeoutChange);
    
    if (currentTimeout > 0) {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);
      window.addEventListener('scroll', handleActivity);
      window.addEventListener('touchstart', handleActivity);
      resetTimer();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      window.removeEventListener('autolock_changed', handleTimeoutChange);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isAppUnlocked]);


  const [bankDetails, setBankDetails] = useState<any>(() => {
    const saved = localStorage.getItem("swiftpay_bankDetails");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [bankAccounts, setBankAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem("swiftpay_bankAccounts");
    if (saved) return JSON.parse(saved);
    const mainSaved = localStorage.getItem("swiftpay_bankDetails");
    return mainSaved ? [JSON.parse(mainSaved)] : [];
  });

  useEffect(() => {
    if (bankDetails?.account) {
      const upi = bankDetails.account + "@swiftpay";
      const blockRef = doc(db, 'blocked_users', upi);
      const unsubscribe = onSnapshot(blockRef, (docSnap) => {
        if (docSnap.exists()) {
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
        }
      }, (error) => {
        console.warn("Blocked user status subscription error:", error);
      });
      return () => unsubscribe();
    }
  }, [bankDetails]);



  
  const logUserLogin = async (details: any) => {
    try {
      // Get IP / Location info if possible (mocking here for demo, or using a free API)
      let location = "Unknown Region";
      let ip = "127.0.0.1";
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        location = `${data.city || ""}, ${data.region || ""}, ${data.country_name || ""}`;
        ip = data.ip;
      } catch (err) {
        // Fallback to mock
        location = "Mumbai, Maharashtra, India";
        ip = "103.119.24.12";
      }

      const device = navigator.userAgent;
      
      const logEntry = {
        name: details.name,
        upi: details.account + "@swiftpay",
        address: location,
        ip: ip,
        device: device,
        status: 'SUCCESS',
        dateString: new Date().toLocaleDateString(),
        timeString: new Date().toLocaleTimeString(),
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, 'user_login_logs'), logEntry);
    } catch (err) {
      console.error("Failed to log user login:", err);
    }
  };


  useEffect(() => {
    if (isBankLinked && bankDetails && !sessionStorage.getItem("swiftpay_logged_in")) {
      logUserLogin(bankDetails);
      sessionStorage.setItem("swiftpay_logged_in", "true");
    }
  }, [isBankLinked, bankDetails]);


  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginLockoutTime, setLoginLockoutTime] = useState<number | null>(null);

  useEffect(() => {
    const savedLockout = localStorage.getItem('swiftpay_user_lockout');
    if (savedLockout) {
      const lockTime = parseInt(savedLockout);
      if (Date.now() < lockTime) {
        setLoginLockoutTime(lockTime);
      } else {
        localStorage.removeItem('swiftpay_user_lockout');
      }
    }
  }, []);

  useEffect(() => {
    if (loginLockoutTime) {
      const interval = setInterval(() => {
        if (Date.now() >= loginLockoutTime) {
          setLoginLockoutTime(null);
          setLoginAttempts(0);
          localStorage.removeItem('swiftpay_user_lockout');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loginLockoutTime]);

  const [pinMode, setPinMode] = useState(false);
  const [loginPin, setLoginPin] = useState('');
  const [showPinReset, setShowPinReset] = useState(false);
  const [loginPinError, setLoginPinError] = useState(false);
  
  const savedAppPin = localStorage.getItem('swiftpay_user_pin');
  const [isSettingPin, setIsSettingPin] = useState(!savedAppPin);
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState(1);

  const handleSetupPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupStep === 1) {
      if (setupPin.length === 4) setSetupStep(2);
    } else {
      if (setupPin === confirmPin) {
        localStorage.setItem('swiftpay_user_pin', setupPin);
        localStorage.setItem('swiftpay_pin', setupPin); // set transaction PIN to same as App PIN
        setIsSettingPin(false);
        setIsAppUnlocked(true);
        toast.success('App PIN set successfully!');
      } else {
        toast.error('PINs do not match. Try again.');
        setSetupPin('');
        setConfirmPin('');
        setSetupStep(1);
      }
    }
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginLockoutTime) return;

    if (savedAppPin && loginPin === savedAppPin) {
      setLoginAttempts(0);
      logSecurityEvent('LOGIN_SUCCESS', 'App unlocked via PIN');
      setIsAppUnlocked(true);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      setLoginPinError(true);
      logSecurityEvent('PIN_FAILED', `Invalid App PIN attempt (${newAttempts}/3)`);
      setLoginPin('');
      
      if (newAttempts >= 3) {
        const lockUntil = Date.now() + 60000;
        setLoginLockoutTime(lockUntil);
        localStorage.setItem('swiftpay_user_lockout', lockUntil.toString());
        toast.error("Too many failed attempts. Locked out for 1 minute.");
      } else {
        toast.error(`Invalid PIN. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };
  const [isBiometricUnlocking, setIsBiometricUnlocking] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const handleAppBiometricUnlock = async () => {
    try {
      setIsBiometricUnlocking(true);
      
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
         setShowScanner(true);
         return;
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "SwiftPay",
          },
          user: {
            id: userId,
            name: "user@swiftpay.com",
            displayName: "SwiftPay User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "none"
        }
      });
      
      toast.success("Identity verified successfully!");
      logSecurityEvent('LOGIN_SUCCESS', 'App unlocked via Biometrics');
      setIsAppUnlocked(true);
    } catch (err: any) {
      setShowScanner(true);
      logSecurityEvent('BIOMETRIC_FAILED', 'Biometric/Screen Lock verification failed or canceled');
    } finally {
      setIsBiometricUnlocking(false);
    }
  };

  const handleShare = async () => {
    let shareUrl = window.location.href;
    let isDevLink = false;
    
    if (shareUrl.includes('ais-dev-')) {
      isDevLink = true;
      shareUrl = shareUrl.replace('ais-dev-', 'ais-pre-');
    }

    const shareData = {
      title: 'SwiftPay App',
      text: 'Check out the secure SwiftPay payment app.',
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        if (isDevLink) toast.info('IMPORTANT: To make this link work (no 404 error), you MUST click "Share" -> "Publish" in the top right corner of AI Studio first!', { duration: 10000 });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Public link copied to clipboard!');
        if (isDevLink) {
          toast.error('IMPORTANT: This link will show a 404 error until you publish it!', { duration: 6000 });
          toast.info('Click the "Share" button in the top right of AI Studio, then "Publish" to make the link work when AI Studio is closed.', { duration: 10000 });
        }
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };


  if (isBlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03] rotate-[-12deg] select-none">
          <h1 className="text-6xl md:text-8xl font-black text-center leading-tight text-red-600">
            ACCOUNT BLOCKED
          </h1>
        </div>
        <div className="relative z-10 w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8 border border-red-500/50">
          <Lock className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 relative z-10">Access Denied</h1>
        <p className="text-slate-400 mb-8 max-w-xs mx-auto relative z-10">
          Your account has been blocked by the app administrator due to suspected cyber fraud activity.
        </p>
      </div>
    );
  }

if (!isAppUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03] rotate-[-12deg] select-none">
          <h1 className="text-6xl md:text-8xl font-black text-center leading-tight">
            <span className="text-indigo-600">WELCOME TO THE </span><br/>
            <span className="text-emerald-600">ROHIT JANGRA </span><br/>
            <span className="text-purple-600">APP</span>
          </h1>
        </div>
        <div className="relative z-10 w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-8 border border-indigo-500/50 cursor-default">
          <Lock className="w-12 h-12 text-indigo-400 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 relative z-10">App Locked</h1>
        
        {isSettingPin ? (
          <form onSubmit={handleSetupPin} className="relative z-10 w-full max-w-xs mx-auto mb-8">
            <h3 className="text-xl font-bold text-white mb-2">Set Up App PIN</h3>
            <p className="text-slate-400 mb-8 text-sm">
              {setupStep === 1 ? 'Enter a 4-digit PIN to secure your app.' : 'Confirm your 4-digit PIN.'}
            </p>
            
            <div className="flex gap-4 justify-center mb-8 relative">
              {[0, 1, 2, 3].map((index) => {
                const val = setupStep === 1 ? setupPin : confirmPin;
                return (
                  <div 
                    key={index} 
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      val.length > index 
                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-110' 
                        : 'bg-slate-800'
                    }`} 
                  />
                );
              })}
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={setupStep === 1 ? setupPin : confirmPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0,4);
                  if (setupStep === 1) setSetupPin(val);
                  else setConfirmPin(val);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                maxLength={4}
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={(setupStep === 1 ? setupPin.length : confirmPin.length) !== 4}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 mb-4"
            >
              {setupStep === 1 ? 'Next' : 'Confirm PIN'}
            </button>
          </form>
        ) : loginLockoutTime ? (
          <div className="relative z-10 max-w-xs mx-auto mb-8 bg-red-950/50 border border-red-900 rounded-2xl p-4">
             <h3 className="text-red-500 font-bold mb-1">Access Locked</h3>
             <p className="text-red-400 text-sm">
               Try again in {Math.ceil((loginLockoutTime - Date.now()) / 1000)}s
             </p>
          </div>
        ) : pinMode ? (
          <>
          <form onSubmit={handlePinLogin} className="relative z-10 w-full max-w-xs mx-auto mb-8">
            <p className="text-slate-400 mb-8">Enter your 4-digit PIN</p>
            
            <div className="flex gap-4 justify-center mb-8 relative">
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index} 
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    loginPin.length > index 
                      ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-110' 
                      : 'bg-slate-800'
                  }`} 
                />
              ))}
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={loginPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0,4);
                  setLoginPin(val);
                  setLoginPinError(false);
                  
                  // Optional auto-submit when 4 digits are reached
                  if (val.length === 4) {
                    // Call a timeout to allow the 4th dot to render before checking
                    setTimeout(() => {
                      const formEvent = { preventDefault: () => {} } as React.FormEvent;
                      // We must pass the current val to handlePinLogin logic if we extract it,
                      // but since we are relying on state, we should just let the submit button work,
                      // or simulate form submission.
                      // Alternatively, we can just let them press the Verify button.
                    }, 50);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                maxLength={4}
                autoFocus
              />
            </div>
            
            {loginPinError && <p className="text-red-500 text-sm mb-4 animate-in shake">Invalid PIN.</p>}
            
            <button
              type="submit"
              disabled={loginPin.length !== 4}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 mb-4"
            >
              Verify PIN
            </button>
            
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPinReset(true)}
                className="text-indigo-400 text-xs font-medium hover:text-indigo-300 transition-colors"
              >
                Forgot PIN?
              </button>
              
              <button
                type="button"
                onClick={() => setPinMode(false)}
                className="text-slate-400 text-sm hover:text-white transition-colors flex items-center gap-2"
              >
                <Fingerprint className="w-4 h-4" /> Use Biometrics instead
              </button>
            </div>
          </form>
          
          {showPinReset && (
            <PinResetFlow 
              onCancel={() => setShowPinReset(false)}
              onSuccess={(newPin) => {
                setShowPinReset(false);
                setLoginPin(newPin); // Option to pre-fill or auto-unlock
              }}
              isAppLevel={true}
            />
          )}
          </>
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">Please authenticate to access your SwiftPay app securely.</p>
            <button 
              onClick={handleAppBiometricUnlock}
              disabled={isBiometricUnlocking}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-full transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 active:scale-95 mb-6"
            >
               {isBiometricUnlocking ? (
                 <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</>
               ) : (
                 <><Fingerprint className="w-5 h-5" /> Biometrics / Screen Lock</>
               )}
            </button>
            <button
              onClick={() => setPinMode(true)}
              className="text-slate-400 text-sm hover:text-white transition-colors flex items-center gap-2"
            >
              <Lock className="w-4 h-4" /> Use App PIN
            </button>
          </div>
        )}

      {showScanner && (
        <BiometricModal 
          onVerify={() => {
            setShowScanner(false);
            logSecurityEvent('LOGIN_SUCCESS', 'App unlocked via Biometrics fallback');
            setIsAppUnlocked(true);
          }}
          onCancel={() => { setShowScanner(false); logSecurityEvent('BIOMETRIC_FAILED', 'Biometric verification modal canceled'); }}
        />
      )}
      </div>
    );
  }

  
return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-50 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03] rotate-[-12deg] select-none">
        <h1 className="text-6xl md:text-8xl font-black text-center leading-tight">
          <span className="text-indigo-600">WELCOME TO THE </span>
          <br/>
          <span className="text-emerald-600">ROHIT JANGRA </span>
          <br/>
          <span className="text-purple-600">APP</span>
        </h1>
      </div>
      <div className="relative z-10 flex flex-col flex-1 h-full">
      <Toaster position="top-center" theme="dark" richColors />
      <NetworkStatus />
      <QuickHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} bankAccounts={bankAccounts} />
      {/* Main Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
             <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">SwiftPay</span>
        </div>
        
        <div className="flex gap-2">
          <NotificationBell />
          <ThemeToggle />
          <InstallButton />
          <button
            onClick={() => setCurrentPage('gateway')}
            className="px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/30"
            title="Gateway"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Gateway</span>
          </button>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Quick Help"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Help</span>
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Share SwiftPay App"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </nav>

      {/* Conditional View Logic */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full"
        >
        {!isBankLinked && currentPage !== 'gateway' ? (
          <BankAccountSetup onComplete={(details) => {
            setBankDetails(details);
            setBankAccounts([details]);
            setIsBankLinked(true);
            localStorage.setItem("swiftpay_bankDetails", JSON.stringify(details));
            localStorage.setItem("swiftpay_bankAccounts", JSON.stringify([details]));
            localStorage.setItem("swiftpay_isBankLinked", "true");
            syncBankAccountState();
            logUserLogin(details);
          }} />
        ) : (
          <>
            
            
            {currentPage === 'panel' && <UserPanel sessionExpiry={sessionExpiry} bankDetails={bankDetails} onBack={() => {
              setIsBankLinked(false);
              localStorage.removeItem("swiftpay_bankDetails");
              localStorage.removeItem("swiftpay_isBankLinked");
            }} />}
            
            {currentPage === 'gateway' && (
              <div className="max-w-4xl mx-auto h-full">
                <SwiftPayGateway />
              </div>
            )}
            
            {currentPage === 'utilities' && (
              <div className="max-w-4xl mx-auto">
                
              </div>
            )}
            
            {currentPage === 'admin' && (
              isAdminAuthenticated ? (
                <MockAdminDashboard
                  onSwitchView={() => {}}
                  onOpenSecurityDashboard={() => {}}
                  autoPredictMood={false}
                  setAutoPredictMood={() => {}}
                  moodInput=""
                  setMoodInput={() => {}}
                  isAnalyzingMood={false}
                  handlePredictMood={async () => {}}
                  userMood=""
                  setUserMood={() => {}}
                  userMoodDetails={null}
                  setUserMoodDetails={() => {}}
                  trackAction={() => {}}
                  triggerVibe={() => {}}
                />
              ) : (
                <PinGate onVerify={() => setIsAdminAuthenticated(true)} />
              )
            )}
          </>
        )}
        </motion.div>
      </main>
          </div>
    </div>
  );
}
