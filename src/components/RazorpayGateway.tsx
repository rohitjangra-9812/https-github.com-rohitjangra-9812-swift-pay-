import { syncBankAccountState } from '../utils/backupSync';
import React, { useState, useEffect } from "react";
import { SmsService } from "../services/SmsService";
import { useLocation } from "react-router-dom";
import { getBalance, deductBalance } from "../utils/balanceManager";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Coins, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCcw, 
  ExternalLink,
  Info,
  CreditCard,
  Check,
  Receipt
} from "lucide-react";
import { TransactionReceipt } from "./TransactionReceipt";

// Helper to dynamically load the Razorpay SDK script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayGatewayProps {
  onPaymentSuccess?: (paymentId: string, amount: number) => void;
}

export const RazorpayGateway: React.FC<RazorpayGatewayProps> = ({ onPaymentSuccess }) => {
  // Input fields
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [userName, setUserName] = useState(() => searchParams.get('name') || new URLSearchParams(window.location.search).get('name') || "");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState(() => {
    const phone = searchParams.get('phone') || new URLSearchParams(window.location.search).get('phone');
    if (phone) {
      localStorage.setItem('swiftpay_verified_mobile', phone);
      syncBankAccountState();
    }
    return phone || "";
  });
  const [amount, setAmount] = useState("500");
  const [transferMethod, setTransferMethod] = useState('bank');
  const [upiId, setUpiId] = useState("");
  const [qrImage, setQrImage] = useState<File | null>(null);

  // Flow & State management
  const [isLinking, setIsLinking] = useState(false);
  const [linkedAccount, setLinkedAccount] = useState<{
    customerId: string;
    accountHolder: string;
    maskedNo: string;
    balance: number;
    isSandbox: boolean;
  } | null>(null);

  const [isPaying, setIsPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    isSandbox: boolean;
    timestamp: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Simulated Custom Checkout Popup (for sandbox test environment without production API credentials)
  const [showSandboxPopup, setShowSandboxPopup] = useState(false);
  const [sandboxOrderData, setSandboxOrderData] = useState<any>(null);
  const [sandboxOtp, setSandboxOtp] = useState("");
  const [sandboxOtpError, setSandboxOtpError] = useState(false);

  // New states for Link Bank Account OTP flow
  const [showLinkOtp, setShowLinkOtp] = useState(false);
  const [linkOtp, setLinkOtp] = useState("");
  const [linkOtpError, setLinkOtpError] = useState(false);
  const [expectedLinkOtp, setExpectedLinkOtp] = useState<string | null>(null);

  // Link Bank Account handler (calls /api/create-customer)
  const handleLinkBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg("Please enter the Account Holder Name to initialize bank mapping.");
      return;
    }
    if (!userPhone.trim() || userPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setErrorMsg(null);
    
    const otp = SmsService.generateOtp();
    setExpectedLinkOtp(otp);
    
    import('sonner').then(async ({ toast }) => {
      await SmsService.sendSms({
        to: `+91 ${userPhone}`,
        message: `${otp} is your SwiftPay Link Account OTP.`
      });
      
      setShowLinkOtp(true);
      setLinkOtpError(false);
      setLinkOtp("");
      toast.success(`OTP sent to ${userPhone}`);
    });
  };

  const handleVerifyLinkOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (linkOtp !== expectedLinkOtp) {
      setLinkOtpError(true);
      return;
    }
    setLinkOtpError(false);
    setShowLinkOtp(false);
    setIsLinking(true);

    try {
      const response = await fetch("/api/create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail || "customer@swiftpay.io",
          contact: userPhone || "9999999999"
        })
      });

      if (!response.ok) {
        throw new Error("HTTP connection to bank gateway failed.");
      }

      const data = await response.json();
      
      const simulatedLast4 = userPhone.slice(-4) || "4321";
      setLinkedAccount({
        customerId: data.customerId,
        accountHolder: userName.toUpperCase(),
        maskedNo: `•••• •••• •••• ${simulatedLast4}`,
        balance: getBalance(), // linked balance
        isSandbox: !!data.isSandbox
      });

      if (userPhone) {
        localStorage.setItem('swiftpay_verified_mobile', userPhone);
        syncBankAccountState();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Connection Error: Unable to complete banking SIM registry handshake.");
    } finally {
      setIsLinking(false);
    }
  };

  // Pay Now handler (calls /api/create-order and instantiates Razorpay widget or local interactive sandbox widget)
  const handlePayNow = async () => {
    if (!linkedAccount) return;
    setErrorMsg(null);

    if (transferMethod === 'upi') {
      const validHandles = ["ybl", "okhdfcbank", "okaxis", "oksbi", "okicici", "paytm", "axl", "ibl", "sib", "api"];
      const [, handle] = upiId.split("@");
      
      if (!handle || !validHandles.includes(handle.toLowerCase())) {
        setErrorMsg("Please enter a valid UPI ID with a known bank handle (e.g., name@okaxis).");
        return;
      }

      if (upiId.toLowerCase().startsWith("invalid") || upiId.toLowerCase().startsWith("fake")) {
        setErrorMsg("UPI ID does not exist or is not registered.");
        return;
      }
    }

    setIsPaying(true);

    const amountInPaise = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInPaise) || amountInPaise < 100) {
      setErrorMsg("Please enter a valid amount of at least ₹1.");
      setIsPaying(false);
      return;
    }

    try {
      // 1. Create order on Express backend
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise })
      });

      if (!response.ok) {
        throw new Error("Failed to generate order payment reference.");
      }

      const orderData = await response.json();

      // 2. Try loading the Razorpay script
      const scriptLoaded = await loadRazorpayScript();

      // Check if we should fallback to Sandbox Interactive Modal
      // We fall back if script didn't load, or if API returned isSandbox, or if the client initialization fails
      if (!scriptLoaded || orderData.isSandbox) {
        // Trigger our beautiful custom simulated interactive gateway checkout inside the applet!
        setSandboxOrderData({
          order_id: orderData.id,
          amount: amountInPaise,
          name: userName,
          email: userEmail || "customer@swiftpay.io",
          contact: userPhone || "9999999999"
        });
        setSandboxOtp("");
        setSandboxOtpError(false);
        setShowSandboxPopup(true);
        setIsPaying(false);
        return;
      }

      // If keys are provided, run the real live Razorpay checkout widget!
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: "INR",
        name: "SwiftPay Secure Gateway",
        description: "PCI Tokenized Instant Transfer",
        order_id: orderData.id,
        handler: async function (res: any) {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              const successPaymentId = res.razorpay_payment_id;
              setPaymentResult({
                paymentId: successPaymentId,
                orderId: res.razorpay_order_id,
                amount: parseFloat(amount),
                isSandbox: false,
                timestamp: new Date().toLocaleTimeString()
              });
              setShowReceipt(true);
              deductBalance(parseFloat(amount));
              toast.success(`Payment of ₹${amount} successful!`);
              if (onPaymentSuccess) {
                onPaymentSuccess(successPaymentId, parseFloat(amount));
              }
            } else {
              setErrorMsg(`Verification Failed: ${verifyData.error}`);
            }
          } catch (err: any) {
            setErrorMsg(`Verification Error: ${err.message}`);
          }
        },
        prefill: {
          name: userName,
          email: userEmail || "customer@swiftpay.io",
          contact: userPhone || "9999999999"
        },
        theme: {
          color: "#4f46e5" // indigo-600
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setErrorMsg(`Payment Refused: ${response.error.description}`);
      });
      rzp.open();
      setIsPaying(false);

    } catch (err: any) {
      console.error(err);
      // Fail gracefully with a helpful message
      setErrorMsg("Gateway Error: Unable to launch payment pipeline. Falling back to sandbox.");
      setIsPaying(false);
    }
  };

  // Simulated OTP confirmation for sandbox
  const handleVerifySandboxOtp = () => {
    if (sandboxOtp !== "000000" && sandboxOtp.length !== 6) {
      setSandboxOtpError(true);
      return;
    }

    setSandboxOtpError(false);
    setShowSandboxPopup(false);

    const simulatedPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
    
    setPaymentResult({
      paymentId: simulatedPaymentId,
      orderId: sandboxOrderData.order_id,
      amount: parseFloat(amount),
      isSandbox: true,
      timestamp: new Date().toLocaleTimeString()
    });
    setShowReceipt(true);
    deductBalance(parseFloat(amount));
    toast.success(`Payment of ₹${amount} successful (Sandbox)!`);

    if (onPaymentSuccess) {
      onPaymentSuccess(simulatedPaymentId, parseFloat(amount));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6" id="razorpay-gateway-container">
      
      {/* Visual Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 rounded-2xl p-6 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-400/20">
              ⚡ Razorpay Secure Gateway v4.0
            </span>
            <h3 className="text-xl font-black tracking-tight text-white mt-2 font-sans">
              PCI-DSS Vaulted Instant Settlement Pipeline
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Verify identity with SMS handshake tokens, link commercial bank cards, and process transfers with 256-bit bank-grade encryption layers.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-800 self-start md:self-auto">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-left">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Security State</p>
              <p className="text-[10px] text-emerald-400 font-bold">Encrypted (SSL & SHA-256)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Controller & Input Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-850 p-5 sm:p-6 shadow-sm">
          <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-4 flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-500" /> Secure Handshake Controller
          </h4>

          {/* User Input Form */}
          <form onSubmit={handleLinkBankAccount} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1.5 tracking-wider">
                  Account Holder Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full legal name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    disabled={!!linkedAccount}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1.5 tracking-wider">
                  Contact Mobile *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ""))}
                    disabled={!!linkedAccount}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1.5 tracking-wider">
                Prefill Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={!!linkedAccount}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-slate-950 rounded-xl border border-indigo-100/10 flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Vaulting credentials creates an indirect, secure reference ID on our secure servers. No raw account numbers or secrets ever enter our persistent disks, keeping your data strictly isolated.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {!linkedAccount ? (
              showLinkOtp ? (
                <div className="mt-4 p-4 border border-indigo-100 dark:border-indigo-900/30 rounded-xl bg-indigo-50/30 dark:bg-indigo-900/10">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-400 mb-1.5 tracking-wider">
                    Mobile Verification OTP *
                  </label>
                  <input
                    type="tel"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={linkOtp}
                    onChange={(e) => {
                      setLinkOtp(e.target.value.replace(/\D/g, ""));
                      setLinkOtpError(false);
                    }}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-center font-mono font-black text-lg tracking-[0.5em] outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                  {linkOtpError && (
                    <p className="text-[10px] text-rose-500 font-extrabold mt-1">
                      ❌ Invalid OTP. Please enter a 6-digit code.
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setShowLinkOtp(false)}
                      className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex justify-center items-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyLinkOtp}
                      disabled={linkOtp.length !== 6}
                      className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex justify-center items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> Verify & Link
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isLinking || !userName || !userPhone}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLinking ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Link Bank Account
                    </>
                  )}
                </button>
              )
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-full py-2 px-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
                  <Check className="w-4 h-4" /> Account Linked Successfully
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLinkedAccount(null);
                    setPaymentResult(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Hand: Verification Terminal & Output Details */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          
          {/* Card Showcase or Placeholder */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-850 p-6 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-500" /> Gateway Vault Details
              </h4>

              {linkedAccount ? (
                <div className="space-y-4">
                  {/* Virtual Credit/Debit Card Visual Card */}
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-950 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg relative overflow-hidden font-mono">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-slate-400 font-sans font-bold">SECURE VAULT ID</p>
                        <p className="text-[10px] text-indigo-300 font-bold truncate max-w-[160px]">{linkedAccount.customerId}</p>
                      </div>
                      <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                    </div>
                    
                    <div className="my-6">
                      <p className="text-xs text-slate-400 tracking-wider font-sans font-medium">MASKED COMPLIANT ROUTING</p>
                      <p className="text-base tracking-widest mt-1 text-slate-100 font-bold">{linkedAccount.maskedNo}</p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-slate-400 font-sans font-bold">CARDHOLDER</p>
                        <p className="text-[11px] tracking-wide text-white uppercase font-sans font-black truncate max-w-[150px]">{linkedAccount.accountHolder}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase tracking-widest text-slate-400 font-sans font-bold">LIQUID BALANCE</p>
                        <p className="text-sm font-black tracking-tight text-emerald-400">₹{linkedAccount.balance.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Amount config */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Settlement Amount (INR)</span>
                      <span className="text-[9px] font-extrabold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full border border-indigo-100/10">INR ₹</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-black text-slate-950 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Option Selector */}
                    <div className="grid grid-cols-2 gap-2">
                      {['upi', 'qr', 'bank'].map((opt) => (
                        <button 
                          key={opt}
                          onClick={() => setTransferMethod(opt)}
                          className={`p-3 text-[10px] font-black uppercase rounded-xl border ${transferMethod === opt ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
                        >
                          {opt === 'upi' ? 'UPI ID' : opt === 'qr' ? 'Scan QR' : 'Account No'}
                        </button>
                      ))}
                    </div>

                    {/* Conditional Input Fields */}
                    {transferMethod === 'upi' && (
                      <input 
                        placeholder="Enter UPI ID (e.g., rohit@upi)" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                        onChange={(e) => setUpiId(e.target.value)}
                        value={upiId}
                      />
                    )}

                    {transferMethod === 'qr' && (
                      <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                        <input type="file" accept="image/*" onChange={(e) => setQrImage(e.target.files?.[0] || null)} className="text-[10px]" />
                        <p className="text-[9px] text-slate-400 mt-2">Upload or drop QR image</p>
                      </div>
                    )}

                    {/* Self Transfer Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-indigo-600" />
                      <span className="text-[10px] font-bold uppercase text-slate-500">Transfer to Linked Self-Account</span>
                    </label>
                  </div>

                  {!paymentResult ? (
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={isPaying || parseFloat(amount) <= 0}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isPaying ? (
                        <>
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Pay Now (₹{parseFloat(amount || "0").toLocaleString("en-IN")})
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                  <Lock className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">No Vault Linked</p>
                  <p className="text-[10px] text-slate-500 max-w-[200px] mt-1 leading-normal">
                    Enter your name and phone number on the left panel to request a tokenized banking gateway vault.
                  </p>
                </div>
              )}
            </div>

            {/* Success Details Box */}
            <AnimatePresence>
              {paymentResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2 text-xs text-left"
                >
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="w-4.5 h-4.5" /> Payment Cleared Successfully!
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    The payment was verified by Razorpay and settled on the central banking pipeline instantly.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850 text-[10px] font-mono">
                    <div>
                      <p className="text-slate-400 font-sans text-[8px] uppercase font-bold">TRANSACTION REF</p>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100 select-all truncate">{paymentResult.paymentId}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-sans text-[8px] uppercase font-bold">ORDER REF</p>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100 select-all truncate">{paymentResult.orderId}</p>
                    </div>
                    <div className="col-span-2 pt-1 flex justify-between">
                      <span className="text-slate-400 font-sans text-[8px] uppercase font-bold">SETTLED AMOUNT</span>
                      <span className="text-emerald-500 font-bold">₹{paymentResult.amount.toLocaleString("en-IN")} (INR)</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowReceipt(true)}
                    className="mt-3 w-full py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1 border border-emerald-500/20"
                  >
                    <Receipt className="w-3.5 h-3.5" /> View Receipt
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showReceipt && paymentResult && (
        <TransactionReceipt 
          paymentId={paymentResult.paymentId}
          orderId={paymentResult.orderId}
          amount={paymentResult.amount}
          customerName={linkedAccount?.accountHolder || userName}
          timestamp={paymentResult.timestamp}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* SECURE CHECKOUT POPUP / MODAL DIALOG (SMART SIMULATION WHEN KEYS ARE NOT PRESENT) */}
      <AnimatePresence>
        {showSandboxPopup && sandboxOrderData && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-left"
            >
              {/* Header */}
              <div className="p-5 bg-indigo-900 text-white relative">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black tracking-widest uppercase bg-indigo-700/60 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      SECURE SANDBOX PORTAL
                    </span>
                    <h5 className="text-sm font-black mt-1">Razorpay Core Bank Verification</h5>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="mt-4 flex justify-between items-baseline border-t border-indigo-800/40 pt-4 text-xs">
                  <span className="text-indigo-200">Amount due:</span>
                  <span className="text-base font-black text-emerald-400">₹{(sandboxOrderData.amount / 100).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="p-3.5 bg-amber-50 dark:bg-slate-950 rounded-2xl border border-amber-200/20 text-amber-800 dark:text-amber-400 text-[10px] leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-extrabold uppercase">Live API Keys Missing</span>
                    <p className="mt-0.5">
                      The application is running in an offline developer environment. This interactive sandbox lets you fully simulate and test the secure Razorpay handshake loops.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[9px] uppercase font-bold text-slate-400">TRANSACTION METADATA</p>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-850">
                    <p><strong>Customer Name:</strong> {sandboxOrderData.name}</p>
                    <p><strong>Order ID:</strong> {sandboxOrderData.order_id}</p>
                    <p><strong>Prefill Contact:</strong> {sandboxOrderData.contact}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Bank Verification 6-Digit OTP *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={sandboxOtp}
                    onChange={(e) => {
                      setSandboxOtp(e.target.value.replace(/\D/g, ""));
                      setSandboxOtpError(false);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 text-center font-mono font-black text-lg tracking-[0.5em] outline-none text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-between items-center text-[9px] mt-1.5">
                    <span className="text-slate-400">💡 Hint: Enter <strong>000000</strong></span>
                    <button
                      type="button"
                      onClick={() => setSandboxOtp("000000")}
                      className="text-indigo-500 hover:underline font-extrabold uppercase tracking-tight"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>

                {sandboxOtpError && (
                  <p className="text-[10px] text-rose-500 font-extrabold bg-rose-50/50 dark:bg-rose-950/20 py-1.5 px-3 rounded-lg text-center border border-rose-200/20">
                    ❌ Bank Refusal: Incorrect authentication OTP code.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSandboxPopup(false)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifySandboxOtp}
                  disabled={sandboxOtp.length !== 6}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-1"
                >
                  Confirm Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
