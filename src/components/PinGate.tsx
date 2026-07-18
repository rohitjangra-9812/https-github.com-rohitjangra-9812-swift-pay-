import { formatCurrency } from '../utils/formatCurrency';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, Loader2, Lock } from 'lucide-react';
import { BiometricModal } from './BiometricModal';
import { PinResetFlow } from './PinResetFlow';
import { logSecurityEvent } from '../utils/securityLogs';
import { toast } from 'sonner';


interface PinGateProps {
  onVerify: () => void;
  amount?: string;
}

export const PinGate: React.FC<PinGateProps> = ({ onVerify, amount }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showPinReset, setShowPinReset] = useState(false);
  const [isBiometricVerifying, setIsBiometricVerifying] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  
  const savedAdminPin = localStorage.getItem('swiftpay_admin_pin');
  const [isSettingPin, setIsSettingPin] = useState(!savedAdminPin);
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState(1);

  useEffect(() => {
    const savedLockout = localStorage.getItem('swiftpay_lockout_time');
    if (savedLockout) {
      const lockTime = parseInt(savedLockout);
      if (Date.now() < lockTime) {
        setLockoutTime(lockTime);
      } else {
        localStorage.removeItem('swiftpay_lockout_time');
      }
    }
  }, []);

  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        if (Date.now() >= lockoutTime) {
          setLockoutTime(null);
          setAttempts(0);
          localStorage.removeItem('swiftpay_lockout_time');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleSetupPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupStep === 1) {
      if (setupPin.length === 4) setSetupStep(2);
    } else {
      if (setupPin === confirmPin) {
        localStorage.setItem('swiftpay_admin_pin', setupPin);
        setIsSettingPin(false);
        toast.success('Admin PIN set successfully!');
        onVerify();
      } else {
        toast.error('PINs do not match. Try again.');
        setSetupPin('');
        setConfirmPin('');
        setSetupStep(1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime) return;

    if (savedAdminPin && pin === savedAdminPin) {
      setAttempts(0);
      logSecurityEvent('LOGIN_SUCCESS', 'Admin area accessed via PIN');
      onVerify();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(true);
      logSecurityEvent('PIN_FAILED', `Invalid Admin PIN attempt (${newAttempts}/3)`);
      setPin('');
      
      if (newAttempts >= 3) {
        const lockUntil = Date.now() + 60000; // 1 minute lockout
        setLockoutTime(lockUntil);
        localStorage.setItem('swiftpay_lockout_time', lockUntil.toString());
        toast.error("Too many failed attempts. Locked out for 1 minute.");
      } else {
        toast.error(`Invalid PIN. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const handleBiometric = async () => {
    // Try WebAuthn first if available
    try {
      if (window.PublicKeyCredential) {
         const challenge = new Uint8Array(32);
         window.crypto.getRandomValues(challenge);
         const userId = new Uint8Array(16);
         window.crypto.getRandomValues(userId);

         await navigator.credentials.create({
           publicKey: {
             challenge: challenge,
             rp: { name: "SwiftPay" },
             user: { id: userId, name: "user@swiftpay.com", displayName: "SwiftPay User" },
             pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
             authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
             timeout: 60000,
             attestation: "none"
           }
         });
         toast.success("Identity verified successfully!");
         logSecurityEvent('LOGIN_SUCCESS', 'Admin area accessed via Biometrics');
         onVerify();
         return;
      }
    } catch (e) {
      // ignore and fallback
    }
    
    setShowScanner(true);
  };

  
return (
    <div className="flex items-center justify-center py-20">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <ShieldCheck className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {amount ? 'Authorize Transaction' : 'Admin Access'}
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          {amount 
            ? `Authenticate to approve payment of ${formatCurrency(amount)}` 
            : 'Enter PIN to access the dashboard'}
        </p>
        
{lockoutTime ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Lock className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
            <h3 className="text-red-500 font-bold mb-2">Access Temporarily Locked</h3>
            <p className="text-slate-500 text-sm">
              Please wait {Math.ceil((lockoutTime - Date.now()) / 1000)} seconds before trying again.
            </p>
          </div>
        ) : isSettingPin ? (
          <form onSubmit={handleSetupPin}>
            <p className="text-slate-500 text-sm mb-6">
              {setupStep === 1 ? 'Set up a 4-digit Admin PIN' : 'Confirm your Admin PIN'}
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
                        : 'bg-slate-200 dark:bg-slate-800'
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
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all mb-4"
            >
              {setupStep === 1 ? 'Next' : 'Confirm PIN'}
            </button>
          </form>
        ) : (
          <>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 justify-center mb-8 relative">
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index} 
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    pin.length > index 
                      ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-110' 
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`} 
                />
              ))}
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0,4);
                  setPin(val);
                  setError(false);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                maxLength={4}
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4 animate-in shake">Invalid PIN.</p>}
            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors mb-4"
            >
              Verify
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowPinReset(true)}
                className="text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:text-indigo-500 transition-colors"
              >
                Forgot PIN?
              </button>
            </div>
          </form>
          
          {showPinReset && (
            <PinResetFlow 
              onCancel={() => setShowPinReset(false)}
              onSuccess={(newPin) => {
                setShowPinReset(false);
                setPin(newPin);
              }}
              isAppLevel={false}
            />
          )}

          <div className="relative flex items-center justify-center mb-4 mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative px-4 bg-white dark:bg-slate-900 text-xs text-slate-400 uppercase font-medium">
              Or
            </div>
          </div>

          <button
            onClick={handleBiometric}
            disabled={isBiometricVerifying}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isBiometricVerifying ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</>
            ) : (
              <><Fingerprint className="w-5 h-5" /> Biometrics / Screen Lock</>
            )}
          </button>
          </>
        )}
      </div>

      {showScanner && (
        <BiometricModal 
          onVerify={() => {
            setShowScanner(false);
            logSecurityEvent('LOGIN_SUCCESS', 'Admin area accessed via Biometrics fallback');
            onVerify();
          }}
          onCancel={() => { setShowScanner(false); logSecurityEvent('BIOMETRIC_FAILED', 'Admin biometric verification canceled'); }}
        />
      )}
    </div>
  );
};
