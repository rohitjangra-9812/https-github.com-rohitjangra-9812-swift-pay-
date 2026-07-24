import { formatCurrency } from '../utils/formatCurrency';
import { getBalance, deductBalance } from '../utils/balanceManager';
import { syncBankAccountState } from '../utils/backupSync';
import React, { useState, useEffect } from "react";
import { db } from '../firebase';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { QRCodeCanvas } from "qrcode.react";
import {
  QrCode,
  Image as ImageIcon,
  AtSign,
  Building2,
  RefreshCcw,
  History,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Smartphone,
  Tv,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Train,
  Landmark,
  ArrowLeft,
  CheckCircle2,
  X,
  XCircle,
  HeadphonesIcon,
  Phone, MessageSquare, Fingerprint,
  User, LogOut, TriangleAlert, Copy, EyeOff
} from "lucide-react";
import { MetroTicketBooking } from "./MetroTicketBooking";
import { QRScanner } from "./QRScanner";
import { GenerateQR } from "./GenerateQR";
import { UploadQR } from "./UploadQR";
import { PaymentSuccess as PaymentSuccessComponent } from "./PaymentSuccess";
import { RecipientInput } from "./RecipientInput";
import { UtilityBillPayment } from "./UtilityBillPayment";
import { ReceiveMoney } from "./ReceiveMoney";
import { AutoPaySetup } from "./AutoPaySetup";
import { EditProfile } from "./EditProfile";


import { PinPrompt } from "./PinPrompt";
import { Feedback } from "./Feedback";
import { SupportTicket } from "./SupportTicket";
import { TransactionHistory } from "./TransactionHistory";
import { SpendingChart } from "./SpendingChart";
import { VoiceAssistant } from "./VoiceAssistant";
import { RecentActivity } from "./RecentActivity";
import { BudgetProgress } from "./BudgetProgress";
import { TaxCalculator } from "./TaxCalculator";
import { RewardsProgram } from "./RewardsProgram";
import { ThemeSelector } from "./ThemeSelector";
import { LanguageSelector } from "./LanguageSelector";
import { MerchantAnalytics } from "./MerchantAnalytics";
import { toast } from "sonner";

import { BankAccountSetup } from "./BankAccountSetup";
import { CurrencyConverter } from "./CurrencyConverter";
import { SecuritySettings } from "./SecuritySettings";
import { SecurityLogs } from "./SecurityLogs";
import { DashboardLayout } from "./DashboardLayout";
import { GlobalSearch } from "./GlobalSearch";
import { Globe } from 'lucide-react';


import { Clock } from 'lucide-react';

const AutoLockTiming = () => {
  const [timeout, setTimeoutVal] = useState(() => {
    const saved = localStorage.getItem('swiftpay_autolock_timeout');
    return saved ? parseInt(saved) : 0;
  });

  const handleSaveTimeout = (val: number) => {
    setTimeoutVal(val);
    localStorage.setItem('swiftpay_autolock_timeout', val.toString());
    window.dispatchEvent(new CustomEvent('autolock_changed', { detail: val }));
  };

  const options = [
    { label: "Immediately", value: 1 },
    { label: "1 minute", value: 60000 },
    { label: "5 minutes", value: 300000 },
    { label: "Never", value: 0 }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-5 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
          <Clock className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Auto-lock Timing</h3>
          <p className="text-[10px] text-slate-400">Require PIN after inactivity</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleSaveTimeout(opt.value)}
            className={`flex items-center justify-center py-2.5 rounded-xl border text-xs font-bold transition-all ${
              timeout === opt.value 
                ? "bg-indigo-600/20 border-indigo-500 text-indigo-300" 
                : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const SessionTimer = ({ expiry }: { expiry: number }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((expiry - Date.now()) / 1000)));

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  if (timeLeft <= 0) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 px-3 py-1.5 rounded-full z-20">
      <div className={`w-2 h-2 rounded-full animate-pulse ${timeLeft < 10 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
      <span className={`text-[10px] font-mono font-bold tracking-widest ${timeLeft < 10 ? 'text-red-400' : 'text-slate-300'}`}>
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export const UserPanel = ({ 
  bankDetails, 
  bankAccounts = [],
  onAddAccount,
  onSwitchAccount,
  onBack,
  sessionExpiry
}: { 
  bankDetails: { name: string; account: string } | null; 
  bankAccounts?: any[];
  onAddAccount?: (d: any) => void;
  onSwitchAccount?: (d: any) => void;
  onBack?: () => void;
  sessionExpiry?: number | null;
}) => {
  const [activeAction, setActiveAction] = useState<any>(null);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    setUserBalance(getBalance());
    
    const verifiedMobile = localStorage.getItem('swiftpay_verified_mobile');
    if (!verifiedMobile) return;

    const balanceRef = doc(db, 'user_backups', verifiedMobile);
    
    const unsubscribe = onSnapshot(balanceRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.balance === 'number') {
          setUserBalance(data.balance);
          localStorage.setItem('swiftpay_user_balance', data.balance.toString());
        }
        if (data.history) {
          localStorage.setItem('swiftpay_history', JSON.stringify(data.history));
          window.dispatchEvent(new Event('swiftpay_history_updated'));
        }
        if (typeof data.points === 'number') {
          localStorage.setItem('swiftpay_points', data.points.toString());
          // Update points state via a custom event
          window.dispatchEvent(new CustomEvent('swiftpay_points_updated', { detail: data.points }));
        }
      } else {
        const currentBal = getBalance();
        setDoc(balanceRef, { balance: currentBal, updatedAt: serverTimestamp() }, { merge: true }).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const newBal = e.detail;
      setUserBalance(newBal);
      const verifiedMobile = localStorage.getItem('swiftpay_verified_mobile');
      if (verifiedMobile) {
        const balanceRef = doc(db, 'user_backups', verifiedMobile);
        setDoc(balanceRef, { balance: newBal, updatedAt: serverTimestamp() }, { merge: true }).catch(console.error);
      }
    };
    window.addEventListener('balance_updated', handleUpdate);
    return () => window.removeEventListener('balance_updated', handleUpdate);
  }, []);

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [transactionNote, setTransactionNote] = useState("");
  const currencySymbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const handleRepeatPayment = (tx: any) => {
    let actionId = 'upi';
    if (tx.method === 'Mobile') actionId = 'mobile_pay';
    if (tx.method === 'Bank Transfer') actionId = 'account';
    
    setActiveAction({ id: actionId, label: 'Pay', icon: QrCode });
    setScannedData({ merchant: tx.recipient || tx.merchant || '', upiId: tx.upiId || '' });
    setAmount(tx.amount || '');
    setTransactionNote(tx.note || '');
  };
  const [scannedData, setScannedData] = useState<{upiId: string, merchant: string} | null>(null);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [showQR, setShowQR] = useState(false);
    const [myUpiId, setMyUpiId] = useState("");

  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileName, setProfileName] = useState("Rohit Jangra");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "bnpl">("bank");
  const [bnplTenure, setBnplTenure] = useState<number>(3);
  const [biometricEnabled, setBiometricEnabled] = useState(() => localStorage.getItem("swiftpay_biometric_enabled") === "true");
  const [privacyMode, setPrivacyMode] = useState(() => localStorage.getItem("swiftpay_privacy_mode") === "true");
  const [swiftPoints, setSwiftPoints] = useState(() => Number(localStorage.getItem("swiftpay_points")) || 1250);
  useEffect(() => {
    const handlePointsUpdate = (e: any) => setSwiftPoints(e.detail);
    window.addEventListener('swiftpay_points_updated', handlePointsUpdate);
    return () => window.removeEventListener('swiftpay_points_updated', handlePointsUpdate);
  }, []);
  const [theme, setTheme] = useState(() => localStorage.getItem("swiftpay_theme") || "slate");
  const [language, setLanguage] = useState(() => localStorage.getItem("swiftpay_lang") || "en");
  const [highValueThreshold, setHighValueThreshold] = useState(() => {
    const saved = localStorage.getItem('swiftpay_high_value_threshold');
    return saved ? parseInt(saved) : 10000;
  });

  useEffect(() => {
    const handleThresholdChange = (e: any) => setHighValueThreshold(e.detail);
    window.addEventListener('high_value_threshold_changed', handleThresholdChange);
    return () => window.removeEventListener('high_value_threshold_changed', handleThresholdChange);
  }, []);

  const toggleBiometric = () => {
    const newState = !biometricEnabled;
    setBiometricEnabled(newState);
    localStorage.setItem("swiftpay_biometric_enabled", newState.toString());
    toast.success(`Biometric authentication ${newState ? 'enabled' : 'disabled'}`);
  };

  const togglePrivacyMode = () => {
    const newState = !privacyMode;
    setPrivacyMode(newState);
    localStorage.setItem("swiftpay_privacy_mode", newState.toString());
    toast.success(`Privacy mode ${newState ? 'enabled' : 'disabled'}`);
  };

  useEffect(() => {
    const loadProfile = () => {
      const saved = localStorage.getItem("swiftpay_user_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.displayName) {
            setProfileName(parsed.displayName);
          }
          if (parsed.avatarUrl) {
            setAvatarUrl(parsed.avatarUrl);
          }
        } catch(e) {}
      }
    };
    loadProfile();
    window.addEventListener("profile_updated", loadProfile);
    return () => window.removeEventListener("profile_updated", loadProfile);
  }, []);




  React.useEffect(() => {
    const mobile = localStorage.getItem("swiftpay_verified_mobile") || "9876543210";
    setMyUpiId(`${mobile}@swiftpay`);
  }, []);

  // Smart Bill Reminders
  React.useEffect(() => {
    const checkReminders = () => {
      const saved = localStorage.getItem('swiftpay_history');
      if (saved) {
        const history = JSON.parse(saved);
        const now = new Date();
        const seen = new Set();
        history.forEach((tx: any) => {
          if (tx.recipient && (tx.recipient.includes('Bill') || tx.recipient.includes('Recharge'))) {
            const name = tx.recipient;
            if (!seen.has(name)) {
              seen.add(name);
              const lastDate = new Date(tx.date);
              const nextDate = new Date(lastDate);
              nextDate.setMonth(nextDate.getMonth() + 1);
              
              const diffTime = nextDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays >= 0 && diffDays <= 3) {
                toast.info(`Upcoming Bill: ${name} is due in ${diffDays} day(s).`, {
                  icon: '📅', duration: 8000,
                  style: { background: '#1e1b4b', color: '#c7d2fe', borderColor: '#3730a3' }
                });
              } else if (diffDays < 0 && diffDays >= -5) {
                toast.warning(`Overdue Bill: ${name} was due ${Math.abs(diffDays)} day(s) ago.`, {
                  icon: '⏰', duration: 8000
                });
              }
            }
          }
        });
      }
    };
    
    // Check after a short delay so toasts don't clump with initial render toasts
    const timer = setTimeout(checkReminders, 2500);
    return () => clearTimeout(timer);
  }, []);

  const paymentOptions = [
    {
      id: "generate_qr",
      label: "Generate QR",
      icon: QrCode,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      id: "receive", label: "Receive Money", icon: QrCode, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    {
      id: "upload",
      label: "Upload QR",
      icon: ImageIcon,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      id: "upi",
      label: "To UPI ID",
      icon: AtSign,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      id: "mobile_pay",
      label: "To Mobile",
      icon: Phone, MessageSquare,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
    },
    {
      id: "account",
      label: "To Account",
      icon: Building2,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      id: "self",
      label: "To Self",
      icon: RefreshCcw,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    {
      id: "autopay",
      label: "AutoPay",
      icon: RefreshCcw,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      color: "text-slate-400",
      bg: "bg-slate-400/10",
    },
    {
      id: "banks",
      label: "Manage Banks",
      icon: Landmark,
      color: "text-teal-400",
      bg: "bg-teal-400/10",
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: MessageSquare,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  const utilityBills = [
    { id: "electricity", label: "Electricity", icon: Zap },
    { id: "water", label: "Water", icon: Droplets },
    { id: "gas", label: "Gas", icon: Flame },
    { id: "broadband", label: "Broadband", icon: Wifi },
    { id: "mobile_prepaid", label: "Prepaid", icon: Smartphone },
    { id: "mobile_postpaid", label: "Postpaid", icon: Smartphone },
    { id: "dth", label: "DTH", icon: Tv },
    { id: "metro", label: "Metro Ticket", icon: Train },
  ];

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setShowPinPrompt(false);
    
    if (paymentMethod === "bank") {
      const deduction = deductBalance(Number(amount));
      if (!deduction.success) {
        setIsProcessing(false);
        toast.error("Payment Failed: " + (deduction.reason || "Insufficient balance."), {
          icon: '❌',
          style: { background: '#450a0a', color: '#fecaca', borderColor: '#7f1d1d' }
        });
        return;
      }
    }
    
    toast.loading("Initiating transaction...", { id: "tx-status", icon: '⏳' });
    
    setTimeout(() => {
       toast.loading("Verifying details securely...", { id: "tx-status", icon: '🔒' });
    }, 100);
    
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      const recipientName = scannedData?.merchant || scannedData?.upiId || activeAction?.label || "Unknown";
      
      toast.success(`Transaction successful! ${formatCurrency(amount || 0)} sent to ${recipientName}`, { 
        id: "tx-status", 
        icon: '✅',
        style: { background: '#052e16', color: '#bbf7d0', borderColor: '#14532d' } 
      });

      // Save history
      const tx = {
        id: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        type: 'sent',
        amount,
        recipient: recipientName,
        upiId: scannedData?.upiId || "",
        date: new Date().toISOString(),
        method: paymentMethod === "bnpl" ? `BNPL (${bnplTenure}m)` : (activeAction?.id === 'mobile_pay' ? "Mobile" : "UPI"),
        note: transactionNote
      };
      const saved = localStorage.getItem('swiftpay_history');
      const history = saved ? JSON.parse(saved) : [];
      history.unshift(tx);
      localStorage.setItem('swiftpay_history', JSON.stringify(history));
      window.dispatchEvent(new Event('swiftpay_history_updated'));
      syncBankAccountState();

      // Gamified Rewards System
      const pointsEarned = Math.floor(Number(amount || 0) / 100);
      if (pointsEarned > 0) {
        setSwiftPoints(prev => {
          const newPoints = prev + pointsEarned;
          localStorage.setItem('swiftpay_points', newPoints.toString());
          return newPoints;
        });
        setTimeout(() => {
          toast.success(`You earned ${pointsEarned} SwiftPoints! 🌟`, { icon: '✨' });
        }, 1500);
      }

      setTimeout(() => {
        setPaymentSuccess(false);
        setActiveAction(null);
        setAmount("");
        setTransactionNote("");
        setScannedData(null);
      }, 500);
    }, 200);
  };

  const handleVoiceCommand = (command: string, match: RegExpMatchArray | null) => {
    switch (command) {
      case 'scan':
        setActiveAction({ id: "scan", label: "Pay", icon: QrCode });
        break;
      case 'receive':
        setActiveAction({ id: "receive", label: "Receive Money", icon: QrCode });
        break;
      case 'history':
        setActiveAction({ id: "history", label: "History", icon: History });
        break;
      case 'feedback':
        setActiveAction({ id: 'feedback', label: 'Feedback' });
        break;
      case 'support':
        setActiveAction({ id: "support", label: "Support", icon: HeadphonesIcon });
        break;
      case 'settings':
        setShowSecuritySettings(true);
        break;
      case 'balance':
        setActiveAction({ id: 'banks' });
        break;
      case 'utility':
        setActiveAction({ id: 'electricity' }); // Default to electricity
        break;
      case 'pay_person':
        if (match && match[2]) {
          const person = match[2];
          setActiveAction({ id: "upi", label: "Pay", icon: QrCode });
          setScannedData({ merchant: person, upiId: `${person.toLowerCase().replace(/\s+/g, '')}@upi` });
        }
        break;
    }
  };

  const utilityIds = ['electricity', 'water', 'gas', 'broadband', 'mobile_prepaid', 'mobile_postpaid', 'dth'];

  const getThemeClasses = () => {
    switch(theme) {
      case 'indigo': return 'bg-indigo-950 border-indigo-900';
      case 'emerald': return 'bg-emerald-950 border-emerald-900';
      case 'rose': return 'bg-rose-950 border-rose-900';
      case 'cyan': return 'bg-cyan-950 border-cyan-900';
      default: return 'bg-slate-950 border-slate-900';
    }
  };

  return (
    <div className={`max-w-md mx-auto text-white min-h-screen relative rounded-3xl shadow-2xl border pb-20 overflow-hidden transition-colors duration-500 ${getThemeClasses()}`}>
      <VoiceAssistant onCommand={handleVoiceCommand} />
      {/* Pending Request Modal */}
      {pendingRequest && !activeAction && !isProcessing && !paymentSuccess && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col p-6 items-center justify-center animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <span className="text-2xl font-bold text-blue-400">{formatCurrency(0).replace(/[0-9.]/g, '')}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Payment Request</h3>
            <p className="text-slate-400 text-sm mb-4">
              <span className="font-bold text-white">{pendingRequest.merchant}</span> is requesting a payment from you.
            </p>
            
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-6">
               <h2 className="text-4xl font-black text-white mb-2">{formatCurrency(pendingRequest.amount)}</h2>
               <p className="text-xs text-slate-500 font-mono">{pendingRequest.upiId}</p>
               {pendingRequest.note && (
                 <div className="mt-3 bg-slate-900 py-2 px-3 rounded-lg border border-slate-800 text-xs text-slate-400 italic">
                   "{pendingRequest.note}"
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setPendingRequest(null)}
                className="py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={() => {
                  setAmount(pendingRequest.amount);
                  setCurrency("INR");
                  setTransactionNote(pendingRequest.note);
                  setScannedData({ merchant: pendingRequest.merchant, upiId: pendingRequest.upiId });
                  setActiveAction({ id: "scan", label: "Pay", icon: QrCode });
                  setPendingRequest(null);
                }}
                className="py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Action Overlay */}
      {activeAction && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col p-6 animate-in slide-in-from-bottom-full duration-300">
          {!(['scan', 'upload', 'upi', 'account', 'receive', 'mobile_pay', 'autopay', 'banks'].includes(activeAction.id) && !scannedData) && !utilityIds.includes(activeAction.id) && (
            <button 
              onClick={() => {
                setActiveAction(null);
                setScannedData(null);
                setAmount("");
        setTransactionNote("");
              }} 
              className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
          )}
          
          {activeAction.id === 'metro' ? (
            <MetroTicketBooking onBack={() => setActiveAction(null)} bankDetails={bankDetails} />
          ) : activeAction.id === 'support' ? (
            <SupportTicket onBack={() => setActiveAction(null)} />
          ) : activeAction.id === 'feedback' ? (
            <Feedback onBack={() => setActiveAction(null)} />
          ) : activeAction.id === 'history' ? (
            <TransactionHistory onRepeatPayment={handleRepeatPayment} />
          ) : utilityIds.includes(activeAction.id) ? (
            <UtilityBillPayment type={activeAction.id} onBack={() => setActiveAction(null)} bankDetails={bankDetails} />
                    ) : activeAction.id === 'autopay' ? (
            <AutoPaySetup onBack={() => setActiveAction(null)} bankDetails={bankDetails} />
          ) : activeAction.id === 'receive' ? (
            <ReceiveMoney onBack={() => setActiveAction(null)} bankDetails={bankDetails} />
          ) : activeAction.id === 'generate_qr' ? (
            <div className="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex flex-col p-6 overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
              <div className="flex items-center gap-4 mb-8 pt-2">
                <button 
                  onClick={() => setActiveAction(null)}
                  className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors border border-slate-700/50 shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
                <h2 className="text-xl font-bold text-white">Generate QR</h2>
              </div>
              <GenerateQR defaultUpiId={`${bankDetails?.account || 'user'}@upi`} />
            </div>
                    ) : activeAction.id === 'banks' ? (
            <div className="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex flex-col p-6 overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
              <div className="flex items-center gap-4 mb-8 pt-2">
                <button 
                  onClick={() => setActiveAction(null)}
                  className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors border border-slate-700/50 shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
                <h2 className="text-xl font-bold text-white">Manage Banks</h2>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                {bankAccounts.map((b, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      onSwitchAccount?.(b);
                      setActiveAction(null);
                      toast.success(`Switched to ${b.name}`);
                    }}
                    className={`bg-slate-900 border ${bankDetails?.account === b.account ? 'border-indigo-500' : 'border-slate-800'} rounded-2xl p-4 flex items-center justify-between hover:bg-slate-800 transition-colors text-left`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{b.name}</p>
                        <p className="text-xs text-slate-400">•••• {b.account?.slice(-4)}</p>
                      </div>
                    </div>
                    {bankDetails?.account === b.account && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    )}
                  </button>
                ))}
                
                {bankAccounts.length < 5 && (
                  <button
                    onClick={() => setActiveAction({ id: "add_bank" })}
                    className="w-full bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-4 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors gap-2 font-bold"
                  >
                    + Add New Bank Account
                  </button>
                )}
                {bankAccounts.length >= 5 && (
                  <p className="text-center text-xs text-slate-500 mt-2">Maximum 5 bank accounts allowed.</p>
                )}
              </div>
            </div>
          ) : activeAction.id === 'add_bank' ? (
            <div className="absolute inset-0 z-[70] bg-slate-950 overflow-y-auto">
              <BankAccountSetup 
                onComplete={(details) => {
                  onAddAccount?.(details);
                  setActiveAction(null);
                  toast.success("Bank account added successfully!");
                }}
              />
              <button 
                onClick={() => setActiveAction({ id: 'banks' })}
                className="absolute top-6 left-6 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors border border-slate-700/50 z-[100]"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          ) : activeAction.id === 'scan' && !scannedData ? (
            <div className="absolute inset-0 z-[60]">
              <QRScanner 
                onBack={() => {
                  setActiveAction(null);
                  setScannedData(null);
                }}
                onScanSuccess={(data) => setScannedData(data)} 
              />
            </div>
          ) : activeAction.id === 'upload' && !scannedData ? (
            <div className="absolute inset-0 z-[60]">
              <UploadQR 
                onBack={() => {
                  setActiveAction(null);
                  setScannedData(null);
                }}
                onScanSuccess={(data) => setScannedData(data)} 
              />
            </div>
          ) : ['upi', 'account', 'mobile_pay'].includes(activeAction.id) && !scannedData ? (
            <div className="absolute inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex flex-col p-6">
              <button 
                onClick={() => {
                  setActiveAction(null);
                  setScannedData(null);
                  setAmount("");
                  setTransactionNote("");
                  setShowQR(false);
                }} 
                className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors mb-6 border border-slate-700/50"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
              <div className="flex-1 flex flex-col justify-center">
                <RecipientInput 
                  type={activeAction.id === "mobile_pay" ? "mobile" : activeAction.id as "upi" | "account"} 
                  onSubmit={(data) => setScannedData(data)} 
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              {paymentSuccess ? (
                <PaymentSuccessComponent 
                  amount={amount} 
                  recipient={scannedData ? scannedData.merchant : undefined} 
                />
              ) : (
                <div className="w-full max-w-sm">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-900 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {activeAction.icon && <activeAction.icon className="w-8 h-8 text-indigo-400" />}
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {scannedData ? `Paying ${scannedData.merchant}` : activeAction.label}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {scannedData 
                        ? `UPI ID: ${scannedData.upiId}` 
                        : paymentOptions.some(o => o.id === activeAction.id) 
                        ? "Enter amount to transfer securely" 
                        : "Pay your utility bill securely"}
                    </p>
                  </div>
                  
                  <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <div className="flex flex-col items-center justify-center gap-2 border-b border-slate-800 pb-4 mb-6">
                      <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 mb-2">
                        <select 
                          className="bg-transparent text-sm font-bold text-slate-300 outline-none cursor-pointer"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-slate-400">{currencySymbols[currency]}</span>
                        <input 
                          type="number" 
                          placeholder="0" 
                          className="bg-transparent text-4xl font-bold text-white w-full max-w-[150px] outline-none text-center placeholder:text-slate-700"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    
                                        <div className="bg-slate-950 rounded-xl p-3 mb-6 flex items-center gap-3 border border-slate-800/50">
                       <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                         <Landmark className="w-5 h-5 text-indigo-400" />
                       </div>
                       <div>
                         <p className="text-sm font-semibold text-white">{bankDetails?.name || 'Unknown Bank'}</p>
                         <p className="text-xs text-slate-400">A/c ending in {bankDetails?.account.slice(-4) || "****"}</p>
                       </div>
                    </div>
                    
                    <div className="mb-6">
                      <input 
                        type="text" 
                        placeholder="Add a note (Optional)" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        value={transactionNote}
                        onChange={(e) => setTransactionNote(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                    
                    <div className="mb-6 flex flex-col items-center">
                      <button 
                        onClick={() => setShowQR(!showQR)} 
                        className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 hover:text-indigo-300 transition-colors"
                      >
                        {showQR ? "Hide QR Code" : "Show QR Code to Pay from Another App"}
                      </button>
                      {showQR && (
                        <div className="bg-white p-3 rounded-2xl animate-in fade-in zoom-in duration-200">
                          <QRCodeCanvas 
                            value={`upi://pay?pa=${scannedData.upiId}&pn=${encodeURIComponent(scannedData.merchant)}&am=${amount || 0}&tn=${encodeURIComponent(transactionNote)}`}
                            size={160}
                            level="H"
                            includeMargin={true}
                            className="w-40 h-40 text-slate-800"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-6 bg-slate-950 p-1 rounded-xl border border-slate-800 flex">
                      <button 
                        onClick={() => setPaymentMethod("bank")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${paymentMethod === "bank" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        Bank Account
                      </button>
                      <button 
                        onClick={() => setPaymentMethod("bnpl")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${paymentMethod === "bnpl" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        Pay Later (BNPL)
                      </button>
                    </div>

                    {paymentMethod === "bnpl" && (
                      <div className="mb-6 bg-slate-900 border border-indigo-500/30 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-bold text-indigo-400">Split into installments</span>
                          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md">0% Interest</span>
                        </div>
                        <div className="flex gap-2">
                          {[3, 6, 9].map(m => (
                            <button
                              key={m}
                              onClick={() => setBnplTenure(m)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${bnplTenure === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                            >
                              {m} Months<br/>
                              <span className="font-normal opacity-80">{formatCurrency((Number(amount) || 0) / m)}/mo</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        const amt = Number(amount);
                        
                        // Fraud Anomaly Detection
                        const currentHour = new Date().getHours();
                        const isOddHour = currentHour >= 0 && currentHour < 5;
                        const isLargeTransaction = highValueThreshold > 0 && amt >= highValueThreshold;
                        
                        if (isLargeTransaction && isOddHour) {
                          toast.warning("Fraud Alert: Unusually large transaction detected at an odd hour. Proceed with caution.", {
                            icon: '🚨',
                            duration: 5000,
                            style: { background: '#7f1d1d', color: '#fecaca', borderColor: '#ef4444' }
                          });
                          if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('Fraud Alert', {
                              body: `Unusually large transaction of ${formatCurrency(amt)} detected at an odd hour.`,
                              icon: '/icon-192.png'
                            });
                          }
                        } else if (isLargeTransaction) {
                          toast.warning(`Notice: High-value transaction (≥ ${formatCurrency(highValueThreshold)}) detected.`, {
                            icon: '🛡️',
                            duration: 3000
                          });
                          if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('High-Value Transaction', {
                              body: `A transaction of ${formatCurrency(amt)} was initiated.`,
                              icon: '/icon-192.png'
                            });
                          }
                        }

                        if (paymentMethod === "bank" && amt > userBalance) {
                          toast.error(`Low Balance Warning! Your balance is ${formatCurrency(userBalance)}, which is less than the transaction amount.`, {
                            icon: '⚠️',
                            style: { background: '#450a0a', color: '#fecaca', borderColor: '#7f1d1d' }
                          });
                        }
                        setShowPinPrompt(true);
                      }}
                      disabled={!amount || Number(amount) <= 0 || isProcessing}
                      className="w-full bg-indigo-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-800 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                      ) : (
                        `Pay ${formatCurrency(amount || 0)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {showPinPrompt && (
            <PinPrompt 
              amount={amount}
              currencySymbol={currencySymbols[currency]}
              onSuccess={handleProcessPayment} 
              onCancel={() => setShowPinPrompt(false)} 
            />
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-indigo-950/40 p-6 rounded-b-3xl border-b border-indigo-900/50 text-center relative overflow-hidden">
        {onBack && (
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="absolute top-6 left-6 w-8 h-8 bg-slate-900/50 rounded-full flex items-center justify-center hover:bg-rose-900/50 transition-colors z-20"
            title="Log Out / Clear Account"
          >
            <LogOut className="w-4 h-4 text-slate-300" />
          </button>
        )}
        {sessionExpiry && <SessionTimer expiry={sessionExpiry} />}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
        <h2 className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">
          SwiftPay App
        </h2>
        <div className="flex items-center justify-center gap-2 relative z-10">
          <button onClick={() => setShowEditProfile(true)} className="relative group transition-transform hover:scale-105 active:scale-95">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-indigo-500/30" />
            ) : (
              <div className="w-8 h-8 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                <User className="w-4 h-4 text-indigo-400" />
              </div>
            )}
          </button>
          <h1 className="text-xl font-bold leading-tight">
            Welcome, {profileName}
          </h1>
        </div>
      </div>

      <div className="p-5 space-y-8 overflow-y-auto h-[calc(100vh-200px)]">
        <GlobalSearch onAdminAccess={() => { document.dispatchEvent(new CustomEvent("trigger_admin")); }} />

        {/* Bank Dashboard */}
        <div className="bg-gradient-to-br from-indigo-900/80 to-slate-900 border border-indigo-800/50 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                <Landmark className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Bank Dashboard</p>
                <p className="font-bold text-white text-sm">{bankDetails?.name || 'Unknown Bank'}</p>
              </div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="mb-6">
            <p className="text-xs text-indigo-200/70 uppercase tracking-wider mb-1">Account Balance</p>
            <h2 className="text-3xl font-black text-white">
              {privacyMode ? '••••••••' : formatCurrency(userBalance)}
            </h2>
          </div>

                    <div className="grid grid-cols-2 gap-4 bg-black/20 p-3 rounded-2xl border border-white/5">
            <div>
              <p className="text-[9px] text-indigo-200/60 uppercase tracking-wider mb-0.5">UPI ID</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-mono font-bold text-indigo-100">{myUpiId}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(myUpiId);
                    toast.success('UPI ID copied to clipboard!', { id: 'copy-upi' });
                  }}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors p-0.5"
                  title="Copy UPI ID"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-[9px] text-indigo-200/60 uppercase tracking-wider mb-0.5">Account Number</p>
              <p className="text-xs font-mono font-bold text-indigo-100">{bankDetails?.account || 'N/A'}</p>
            </div>
          </div>
        </div>

        <DashboardLayout widgets={[
          {
            id: 'chart',
            title: 'Spending Chart',
            component: <SpendingChart />
          },
          {
            id: 'budget',
            title: 'Budget Progress',
            component: <BudgetProgress />
          },
          {
            id: 'transfers',
            title: 'Money Transfers',
            component: (
              <section>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 px-1">
                  Money Transfers
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {paymentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setActiveAction(opt)}
                      className="flex flex-col items-center justify-center aspect-square bg-slate-900 border border-slate-800 rounded-2xl p-2 hover:bg-slate-800/80 transition-all shadow-sm active:scale-95"
                    >
                      <div
                        className={`w-10 h-10 ${opt.bg} ${opt.color} rounded-full flex items-center justify-center mb-2`}
                      >
                        <opt.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-medium text-center text-slate-300 leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )
          },
          {
            id: 'utilities',
            title: 'Utility Bills',
            component: (
              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Utility Bills
                  </h3>
                  <button className="text-[10px] text-indigo-400 font-bold uppercase hover:text-indigo-300">
                    View All
                  </button>
                </div>
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4">
                  <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                    {utilityBills.map((bill) => (
                      <button
                        key={bill.id}
                        onClick={() => setActiveAction(bill)}
                        className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity active:scale-95"
                      >
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 shadow-inner">
                          <bill.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-medium text-slate-400 text-center uppercase tracking-wider">
                          {bill.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )
          },
          {
            id: 'rewards',
            title: 'SwiftPoints',
            component: <RewardsProgram 
              points={swiftPoints} 
              onRedeem={(pts, value) => {
                setSwiftPoints(prev => {
                  const newPts = prev - pts;
                  localStorage.setItem('swiftpay_points', newPts.toString());
                  return newPts;
                });
                // Mock adding cashback to balance
                const saved = localStorage.getItem('swiftpay_user_balance');
                if (saved) {
                  localStorage.setItem('swiftpay_user_balance', (Number(saved) + value).toString());
                  window.dispatchEvent(new CustomEvent('balance_updated', { detail: Number(saved) + value }));
                }
              }} 
            />
          },
          {
            id: 'tax_calculator',
            title: 'Tax Calculator',
            component: <TaxCalculator />
          },
          {
            id: 'merchant_analytics',
            title: 'Business Analytics',
            component: <MerchantAnalytics />
          },
          {
            id: 'activity',
            title: 'Recent Activity',
            component: <RecentActivity onShowAll={() => setActiveAction({ id: 'history', label: 'History', icon: History })} onRepeatPayment={handleRepeatPayment} />
          }
        ]} />

        {/* Promo / Banner */}
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-5 flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-indigo-100">
              Zero Fee Transfers
            </h4>
            <p className="text-[10px] text-indigo-300 mt-1 uppercase tracking-wide">
              Secure 256-bit encryption
            </p>
          </div>
          <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-400/30">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Refer & Earn */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-3xl p-5 flex flex-col justify-center mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm text-emerald-100">
                Refer & Earn
              </h4>
              <p className="text-[10px] text-emerald-300 mt-1 uppercase tracking-wide">
                Invite friends, get {formatCurrency(50)}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-400/30">
              <span className="text-emerald-400 font-bold text-lg">{formatCurrency(0).replace(/[0-9.]/g, '')}</span>
            </div>
          </div>
          <button
            onClick={() => {
              let shareUrl = window.location.href;
              if (shareUrl.includes('ais-dev-')) shareUrl = shareUrl.replace('ais-dev-', 'ais-pre-');

              if (navigator.share) {
                navigator.share({ title: "SwiftPay", text: "Use my referral code FRIEND50 to get a welcome bonus on SwiftPay!", url: shareUrl });
              } else {
                navigator.clipboard.writeText(`FRIEND50 - ${shareUrl}`);
                toast.success("Referral code and link copied to clipboard!");
              }
            }}
            className="w-full py-2.5 bg-emerald-600/80 hover:bg-emerald-600 transition-colors rounded-xl text-white text-xs font-bold uppercase tracking-wider border border-emerald-500/50 relative z-10"
          >
            Share Referral Link
          </button>
        </div>

        <AutoLockTiming />

        <div className="mb-8">
          <ThemeSelector 
            currentTheme={theme} 
            onSelectTheme={(t) => {
              setTheme(t);
              localStorage.setItem('swiftpay_theme', t);
            }} 
          />
        </div>

        <div className="mb-8">
          <LanguageSelector 
            currentLang={language} 
            onSelectLang={(l) => {
              setLanguage(l);
              localStorage.setItem('swiftpay_lang', l);
            }} 
          />
        </div>

        {/* Security Settings Block */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-5 mb-8 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Security Settings</h4>
                <p className="text-[10px] text-slate-400">Configure auto-lock</p>
              </div>
            </div>
            <button
              onClick={() => setShowSecuritySettings(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl text-white text-xs font-bold border border-slate-700"
            >
              Configure
            </button>
          </div>
          
          <div className="h-px w-full bg-slate-800/50"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Biometric Login</h4>
                <p className="text-[10px] text-slate-400">Faster access</p>
              </div>
            </div>
            <button
              onClick={toggleBiometric}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${biometricEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute transition-all ${biometricEnabled ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
          
          <div className="h-px w-full bg-slate-800/50"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                <EyeOff className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Privacy Mode</h4>
                <p className="text-[10px] text-slate-400">Mask balances in public</p>
              </div>
            </div>
            <button
              onClick={togglePrivacyMode}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${privacyMode ? 'bg-blue-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute transition-all ${privacyMode ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
          
          <div className="h-px w-full bg-slate-800/50"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Audit Logs</h4>
                <p className="text-[10px] text-slate-400">View authentication events</p>
              </div>
            </div>
            <button
              onClick={() => setActiveAction({ id: 'security_logs', label: 'Security Logs' })}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl text-white text-xs font-bold border border-slate-700"
            >
              View Logs
            </button>
          </div>
        </div>
        
        {/* Feedback Card */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-5 mb-4 text-center relative overflow-hidden flex flex-col items-center group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full group-hover:bg-indigo-500/30 transition-colors pointer-events-none"></div>
        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 mb-3 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
        </div>
        <h4 className="font-bold text-sm text-white mb-1">
          Share Feedback
        </h4>
        <p className="text-[10px] text-slate-400 mb-4 max-w-[200px] leading-relaxed">
          Help us improve! Share what needs to be changed or added. Sent directly to admins.
        </p>
        <button
          onClick={() => setActiveAction({ id: 'feedback', label: 'Feedback' })}
          className="w-full max-w-[200px] py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/20 relative z-10"
        >
          Submit Feedback
        </button>
      </div>

      {/* Support */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-5 mb-8 text-center relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none"></div>
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 mb-3 shadow-inner">
            <HeadphonesIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1">
            24/7 Support
          </h4>
          <p className="text-[10px] text-slate-400 mb-4 max-w-[200px] leading-relaxed">
            Need help? Raise a ticket and get support anytime directly from our admins.
          </p>
          <button
            onClick={() => setActiveAction({ id: 'support', label: 'Support' })}
            className="w-full max-w-[200px] py-2.5 bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl text-white text-xs font-bold uppercase tracking-wider border border-slate-700 relative z-10"
          >
            Raise Ticket
          </button>
        </div>
      </div>

      {/* Floating Actions */}
      {!showCurrencyConverter && !showSecuritySettings && !activeAction && !scannedData && !pendingRequest && (
        <>
          <button 
            onClick={() => setActiveAction({ id: 'scan', label: 'Scan QR', icon: QrCode })}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all z-40 group border border-indigo-400/30"
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white font-bold tracking-wider">SCAN & PAY</span>
            </div>
          </button>

          <button 
            onClick={() => setShowCurrencyConverter(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all z-40 group border border-slate-700"
          >
            <Globe className="w-5 h-5 text-slate-300 group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {showCurrencyConverter && (
        <CurrencyConverter onClose={() => setShowCurrencyConverter(false)} />
      )}
      
      {showSecuritySettings && (
        <SecuritySettings onClose={() => setShowSecuritySettings(false)} />
      )}
      
      {showEditProfile && (
        <EditProfile onClose={() => setShowEditProfile(false)} />
      )}
      
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <TriangleAlert className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Logout & Clear Account</h3>
              <p className="text-sm text-slate-400 mb-6">
                Are you sure you want to log out? This action will clear your account data from this device.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    if (onBack) onBack();
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
                >
                  Yes, Clear Account
                </button>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
