import React, { useState } from "react";
import { LockKeyhole, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logSecurityEvent } from "../utils/securityLogs";
import { SmsService } from "../services/SmsService";

export const PinResetFlow = ({ 
  onCancel, 
  onSuccess,
  isAppLevel = true
}: { 
  onCancel: () => void; 
  onSuccess: (newPin: string) => void;
  isAppLevel?: boolean;
}) => {
  const [resetStep, setResetStep] = useState<"details" | "email_otp" | "otp" | "new_pin">("details");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  
  const [emailOtp, setEmailOtp] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  
  const [expectedEmailOtp, setExpectedEmailOtp] = useState<string | null>(null);
  const [expectedMobileOtp, setExpectedMobileOtp] = useState<string | null>(null);
  const [expectedAadhaarOtp, setExpectedAadhaarOtp] = useState<string | null>(null);
  
  const [newPin, setNewPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (resetStep === "details") {
      if (aadhaar.length !== 12 || mobile.length !== 10 || !email.includes("@")) {
        toast.error("Invalid details format.");
        setIsLoading(false);
        return;
      }
      
      const otp = SmsService.generateOtp();
      setExpectedEmailOtp(otp);
      
      // Simulate Email sending...
      setTimeout(() => {
        setIsLoading(false);
        setResetStep("email_otp");
        toast.success(`Verification code sent to ${email}`);
        toast.info(`📧 Email from SwiftPay: ${otp} is your verification code.`, { duration: 8000 });
      }, 800);
      
    } else if (resetStep === "email_otp") {
      if (emailOtp !== expectedEmailOtp) {
        toast.error("Invalid Email OTP.");
        setIsLoading(false);
        return;
      }
      
      const mobOtp = SmsService.generateOtp();
      const aadOtp = SmsService.generateOtp();
      setExpectedMobileOtp(mobOtp);
      setExpectedAadhaarOtp(aadOtp);
      
      try {
        await SmsService.sendSms({
          to: `+91 ${mobile}`,
          message: `${mobOtp} is your SwiftPay Mobile verification code.`
        });
        
        await SmsService.sendSms({
          to: `Aadhaar Linked Mobile`,
          message: `${aadOtp} is your Aadhaar verification code for SwiftPay.`
        });
        
        setResetStep("otp");
        toast.success("Email verified. OTPs sent to mobile and Aadhaar registered number.");
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
        toast.success("Verification successful. Set a new PIN.");
      }, 200);
    } else if (resetStep === "new_pin") {
      if (newPin.length !== 4) {
        toast.error("PIN must be 4 digits.");
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        setIsLoading(false);
        const storageKey = isAppLevel ? 'swiftpay_user_pin' : 'swiftpay_admin_pin'; 
        localStorage.setItem(storageKey, newPin);
        localStorage.setItem('swiftpay_pin', newPin);
        
        logSecurityEvent('LOGIN_SUCCESS', 'Security PIN successfully reset via KYC & Email');
        toast.success("PIN reset successfully.");
        onSuccess(newPin);
      }, 200);
    }
  };

  return (
    <div className="absolute inset-0 z-[80] bg-slate-950/95 backdrop-blur-md flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300">
      <button 
        onClick={onCancel}
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
          {resetStep === "details" ? "Enter Aadhaar, Mobile, & Email to begin reset." 
           : resetStep === "email_otp" ? "Verify your email address."
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
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Registered Email</label>
                <input 
                  type="email" placeholder="name@example.com" required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </>
          )}

          {resetStep === "email_otp" && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Email Verification Code</label>
              <input 
                type="tel" maxLength={6} placeholder="6-digit code" required
                title="Enter any 6 digits for testing"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono text-center tracking-[0.5em]"
                value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
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
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-600/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};
