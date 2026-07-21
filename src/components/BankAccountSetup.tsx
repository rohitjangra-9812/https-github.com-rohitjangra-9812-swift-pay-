import { formatCurrency } from '../utils/formatCurrency';
import React, { useState } from "react";
import { toast } from "sonner";
import { Landmark, Loader2, Smartphone, ShieldCheck, UserCircle, Hash, Building, FileDigit, ArrowRight } from "lucide-react";
import { OTPVerification } from "./OTPVerification";
import { fetchCloudBackup } from "../utils/backupSync";

export const BankAccountSetup = ({ onComplete }: { onComplete: (details: { name: string, account: string }) => void }) => {
  const [step, setStep] = useState<'mobile' | 'otp' | 'bank' | 'pin'>('mobile');
  
  // Mobile & OTP State
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  // Bank Details State
  const [bankDetails, setBankDetails] = useState({ 
    name: "", 
    ifsc: "",
    accountName: "",
    aadhaar: "",
    account: ""
  });
  const [isLinking, setIsLinking] = useState(false);

  // Pin State
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const [isRestoring, setIsRestoring] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 10) return;
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setStep('otp');
    }, 200);
  };

  const handleLinkBank = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);
    setTimeout(() => {
      setIsLinking(false);
      setStep('pin');
    }, 200);
  };

  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4 || pin !== confirmPin) return;
    localStorage.setItem('swiftpay_pin', pin);
    localStorage.setItem('swiftpay_user_pin', pin); // Ensure App lock PIN is also set to this!
    if (referralCode) { toast.success(`Referral applied! {formatCurrency(50)} added as a welcome bonus for using ${referralCode}`, { duration: 4000 }); }
    onComplete({ name: bankDetails.name, account: bankDetails.account });
  };

  return (
    <div className="max-w-md mx-auto bg-slate-950 text-white min-h-[600px] relative rounded-3xl shadow-2xl border border-slate-900 overflow-hidden flex flex-col p-8">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 border border-indigo-500/50">
          {step === 'mobile' || step === 'otp' ? (
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          ) : (
            <Landmark className="w-8 h-8 text-indigo-400" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {step === 'mobile' ? 'Verify Mobile' : step === 'otp' ? 'Enter OTP' : 'Link Bank Account'}
        </h2>
        <p className="text-slate-400 text-center text-sm px-4">
          {step === 'mobile' 
            ? 'Enter your registered mobile number to proceed securely.' 
            : step === 'otp' 
            ? `We've sent a secure 6-digit OTP to +91 ${mobile}` 
            : 'Enter your bank details to enable instant seamless transfers.'}
        </p>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        {step === 'mobile' && (
          <form onSubmit={handleSendOtp} className="w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-medium">+91</span>
                </div>
                <input 
                  required
                  type="tel" 
                  maxLength={10}
                  placeholder="98765 43210" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-medium tracking-wide"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                />
                <Smartphone className="absolute right-4 top-3.5 w-5 h-5 text-slate-600" />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSendingOtp || mobile.length < 10}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-xl font-bold mt-6 transition-all flex items-center justify-center gap-2"
            >
              {isSendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Get Secure OTP <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {step === 'otp' && (
          isRestoring ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in zoom-in duration-300">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-white font-medium">Syncing cloud backup...</p>
              <p className="text-slate-400 text-sm text-center">Restoring your linked bank accounts securely</p>
            </div>
          ) : (
            <OTPVerification 
              mobile={mobile} 
              onVerify={async () => { 
                localStorage.setItem("swiftpay_verified_mobile", mobile);
                setIsRestoring(true);
                try {
                  const backup = await fetchCloudBackup(mobile);
                  if (backup && backup.isBankLinked) {
                    if (backup.bankDetails) {
                      localStorage.setItem("swiftpay_bankDetails", JSON.stringify(backup.bankDetails));
                    }
                    if (backup.bankAccounts) {
                      localStorage.setItem("swiftpay_bankAccounts", JSON.stringify(backup.bankAccounts));
                    }
                    localStorage.setItem("swiftpay_isBankLinked", "true");
                    toast.success("Bank accounts restored from cloud sync!");
                    // Trigger onComplete immediately to bypass manual setup
                    if (backup.bankDetails) {
                      onComplete(backup.bankDetails);
                    } else {
                      setStep('bank');
                    }
                  } else {
                    setStep('bank');
                  }
                } catch (error) {
                  console.error("Cloud sync failed", error);
                  setStep('bank');
                } finally {
                  setIsRestoring(false);
                }
              }}
              onChangeNumber={() => setStep('mobile')}
            />
          )
        )}

        {step === 'bank' && (
          <form onSubmit={handleLinkBank} className="w-full space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Bank Name</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  placeholder="e.g. HDFC Bank, SBI" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={bankDetails.name}
                  onChange={(e) => setBankDetails({...bankDetails, name: e.target.value})}
                />
                <Building className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">IFSC Code</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  placeholder="e.g. HDFC0001234" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors uppercase"
                  value={bankDetails.ifsc}
                  onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})}
                />
                <Hash className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Account Number</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  placeholder="Enter account number" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={bankDetails.account}
                  onChange={(e) => setBankDetails({...bankDetails, account: e.target.value.replace(/\D/g, '')})}
                />
                <FileDigit className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Account Holder Name</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  placeholder="As per bank records" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                />
                <UserCircle className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Aadhaar Number (Registered with Bank)</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  maxLength={12}
                  placeholder="12-digit Aadhaar Number" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={bankDetails.aadhaar}
                  onChange={(e) => setBankDetails({...bankDetails, aadhaar: e.target.value.replace(/\D/g, '')})}
                />
                <ShieldCheck className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Referral Code (Optional)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. FRIEND50" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors uppercase" 
                  value={referralCode} 
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())} 
                />
                <span className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500">🎁</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLinking || !bankDetails.name || !bankDetails.account || !bankDetails.ifsc || !bankDetails.accountName || bankDetails.aadhaar.length < 12}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-3.5 rounded-xl font-bold mt-4 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {isLinking ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying with NPCI...</> : "Securely Link Bank"}
            </button>
          </form>
        )}
        
        {step === 'pin' && (
          <form onSubmit={handleSetPin} className="w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-white">Create a 4-digit PIN</h3>
              <p className="text-sm text-slate-400 mt-1">This PIN will be used to authorize all your transactions</p>
            </div>
            
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Enter PIN</label>
              <input 
                required
                type="password"
                maxLength={4}
                pattern="\d{4}"
                placeholder="••••" 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center text-2xl tracking-[1em] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Confirm PIN</label>
              <input 
                required
                type="password"
                maxLength={4}
                pattern="\d{4}"
                placeholder="••••" 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-center text-2xl tracking-[1em] text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              />
              {pin && confirmPin && pin !== confirmPin && (
                <p className="text-red-400 text-xs mt-2 text-center">PINs do not match</p>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={pin.length !== 4 || pin !== confirmPin}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-xl font-bold mt-4 transition-all shadow-lg shadow-indigo-600/20"
            >
              Complete Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
