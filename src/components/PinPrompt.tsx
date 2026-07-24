import React, { useState } from "react";
import { Loader2, ShieldCheck, XCircle, Fingerprint, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { BiometricModal } from "./BiometricModal";
import { logSecurityEvent } from "../utils/securityLogs";
import { SmsService } from "../services/SmsService";

interface PinPromptProps {
  amount: string;
  currencySymbol?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PinPrompt = ({ amount, currencySymbol = "₹", onSuccess, onCancel }: PinPromptProps) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBiometricVerifying, setIsBiometricVerifying] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // Reset PIN State
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState<"details" | "otp" | "new_pin">("details");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [expectedAadhaarOtp, setExpectedAadhaarOtp] = useState<string | null>(null);
  const [expectedMobileOtp, setExpectedMobileOtp] = useState<string | null>(null);
  const [newPin, setNewPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      const savedPin = localStorage.getItem('swiftpay_pin');
      
      if (savedPin && pin === savedPin) {
        logSecurityEvent('TRANSACTION_SUCCESS', 'Transaction authorized via PIN');
        onSuccess();
      } else {
        setError(true);
      logSecurityEvent('PIN_FAILED', 'Transaction PIN verification failed');
        setPin("");
      }
    }, 200);
  };

  const handleBiometric = async () => {
    setShowScanner(true);
    setTimeout(() => {
      setShowScanner(false);
      toast.success("Identity verified successfully!");
      onSuccess();
    }, 500);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (resetStep === "details") {
      if (aadhaar.length !== 12 || mobile.length !== 10) {
        toast.error("Invalid details format.");
        setIsLoading(false);
        return;
      }
      
      const aadOtp = SmsService.generateOtp();
      const mobOtp = SmsService.generateOtp();
      setExpectedAadhaarOtp(aadOtp);
      setExpectedMobileOtp(mobOtp);
      
      try {
        await SmsService.sendSms({
          to: `Aadhaar Linked Mobile`,
          message: `${aadOtp} is your Aadhaar verification code for SwiftPay.`
        });
        
        await SmsService.sendSms({
          to: `+91 ${mobile}`,
          message: `${mobOtp} is your SwiftPay Mobile verification code.`
        });
        
        setResetStep("otp");
        toast.success("OTP sent to Aadhaar linked mobile and SwiftPay registered mobile.");
      } finally {
        setIsLoading(false);
      }
    } else if (resetStep === "otp") {
      if ((aadhaarOtp !== expectedAadhaarOtp) || (mobileOtp !== expectedMobileOtp)) {
        toast.error("Invalid OTPs.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        setResetStep("new_pin");
        toast.success("Identity verified.");
      }, 200);
    } else if (resetStep === "new_pin") {
      if (newPin.length !== 4) {
        toast.error("PIN must be 4 digits.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        localStorage.setItem('swiftpay_pin', newPin);
        toast.success("PIN reset successfully!");
        setShowReset(false);
        setResetStep("details");
      }, 200);
    }
  };

  if (showReset) {
    return (
      <div className="absolute inset-0 z-[80] bg-slate-950/95 backdrop-blur-md flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300">
        <button 
          onClick={() => { setShowReset(false); setResetStep("details"); }}
          className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors mb-6 border border-slate-700/50 absolute top-6 right-6 z-10"
        >
          <XCircle className="w-6 h-6 text-slate-400" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50">
            <LockKeyhole className="w-8 h-8 text-emerald-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">Reset PIN</h3>
          <p className="text-slate-400 text-center mb-8 text-sm">
            {resetStep === "details" ? "Enter Aadhaar & Mobile Number to begin reset." 
            : resetStep === "otp" ? "Enter OTPs to verify identity." 
            : "Set your new 4-digit PIN."}
          </p>

          <form onSubmit={handleResetSubmit} className="w-full space-y-4">
            {resetStep === "details" && (
              <>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Aadhaar Number</label>
                  <input 
                    type="tel" maxLength={12} placeholder="Enter 12-digit Aadhaar" required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Registered Mobile No</label>
                  <input 
                    type="tel" maxLength={10} placeholder="Enter 10-digit Mobile" required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </>
            )}

            {resetStep === "otp" && (
              <>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Aadhaar OTP</label>
                  <input 
                    type="tel" maxLength={6} placeholder="6-digit OTP" required
                    title="Enter any 6 digits for testing"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono text-center tracking-[0.5em]"
                    value={aadhaarOtp} onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Mobile OTP</label>
                  <input 
                    type="tel" maxLength={6} placeholder="6-digit OTP" required
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono text-center tracking-[0.5em]"
                    value={mobileOtp} onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </>
            )}

            {resetStep === "new_pin" && (
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">New 4-Digit PIN</label>
                <input 
                  type="password" maxLength={4} placeholder="••••" required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors text-center text-3xl tracking-[1em]"
                  value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  
return (
    <div className="absolute inset-0 z-[70] bg-slate-950/95 backdrop-blur-md flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300">
      <button 
        onClick={onCancel}
        disabled={isVerifying || isBiometricVerifying}
        className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors mb-6 border border-slate-700/50 absolute top-6 right-6 z-10"
      >
        <XCircle className="w-6 h-6 text-slate-400" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 border border-indigo-500/50">
          <ShieldCheck className="w-8 h-8 text-indigo-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">Enter PIN</h3>
        <p className="text-slate-400 text-center mb-8">
          Enter your 4-digit SwiftPay PIN to authorize payment of <span className="font-bold text-white">{currencySymbol}{amount}</span>
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-4 justify-center mb-8 relative">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index} 
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  pin.length > index 
                    ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-110' 
                    : 'bg-slate-800'
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
              disabled={isVerifying || isBiometricVerifying}
            />
          </div>
          
          <div className="h-6 text-center mb-6">
            {error && <p className="text-red-400 text-sm animate-in shake">Incorrect PIN. Try again.</p>}
          </div>

          <button 
            type="submit"
            disabled={pin.length !== 4 || isVerifying || isBiometricVerifying}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 mb-4"
          >
            {isVerifying ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
            ) : (
              "Confirm Payment"
            )}
          </button>
        </form>

        <button 
          type="button" 
          onClick={() => setShowReset(true)}
          className="text-xs text-indigo-400 font-medium hover:text-indigo-300 mb-6"
        >
          Forgot PIN?
        </button>

        <div className="relative flex items-center justify-center w-full mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative px-4 bg-slate-950 text-xs text-slate-500 uppercase font-bold tracking-wider">
            Or Use Biometrics
          </div>
        </div>

        <button
          type="button"
          onClick={handleBiometric}
          disabled={isVerifying || isBiometricVerifying}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-900/50 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-800"
        >
          {isBiometricVerifying ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Scanning Fingerprint...</>
          ) : (
            <><Fingerprint className="w-5 h-5 text-indigo-400" /> Authenticate via Touch ID / Face ID</>
          )}
        </button>
      </div>

      {showScanner && (
        <BiometricModal 
          onVerify={() => {
            setShowScanner(false);
            logSecurityEvent('TRANSACTION_SUCCESS', 'Transaction authorized via Biometrics fallback');
            onSuccess();
          }}
          onCancel={() => { setShowScanner(false); logSecurityEvent('BIOMETRIC_FAILED', 'Transaction biometric verification canceled'); }}
        />
      )}
    </div>
  );
};
