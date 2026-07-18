import React, { useState, useEffect } from "react";
import { Loader2, MessageSquare } from "lucide-react";

interface OTPVerificationProps {
  mobile: string;
  onVerify: () => void;
  onChangeNumber: () => void;
}

export const OTPVerification = ({ mobile, onVerify, onChangeNumber }: OTPVerificationProps) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Simulate sending an SMS
    const timer = setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedCode(code);
      setShowNotification(true);
      
      // Auto-hide notification after 6 seconds
      setTimeout(() => setShowNotification(false), 6000);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== simulatedCode && otp !== "123456") {
      setError(true);
      return;
    }
    
    setError(false);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerify();
    }, 200);
  };

  return (
    <div className="w-full relative">
      {/* Simulated SMS Notification */}
      {showNotification && simulatedCode && (
        <div className="absolute -top-32 left-0 right-0 bg-slate-800 border border-slate-700 p-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-8 fade-in duration-300 flex gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-0.5">Messages • Now</p>
            <p className="text-xs text-slate-300 leading-tight">
              {simulatedCode} is your SwiftPay verification code. Do not share this with anyone.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleVerifyOtp} className="w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 flex justify-between">
            <span>Secure OTP</span>
            <button type="button" onClick={onChangeNumber} className="text-indigo-400 hover:text-indigo-300 normal-case">Change Number</button>
          </label>
          <div className="relative">
            <input 
              required
              autoFocus
              type="text" 
              maxLength={6}
              placeholder="• • • • • •" 
              className={`w-full bg-slate-900 border rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none transition-colors font-mono tracking-[0.5em] text-center text-lg ${
                error ? "border-red-500 focus:border-red-500" : "border-slate-800 focus:border-indigo-500"
              }`}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                if (error) setError(false);
              }}
            />
          </div>
          {error && <p className="text-red-400 text-xs mt-2 pl-1">Invalid OTP. Please check the SMS and try again.</p>}
        </div>
        
        <button 
          type="submit" 
          disabled={isVerifying || otp.length < 6}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-xl font-bold mt-6 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
        </button>
      </form>
    </div>
  );
};
