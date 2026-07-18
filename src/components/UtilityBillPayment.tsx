import { getBalance, deductBalance } from '../utils/balanceManager';
import { formatCurrency } from '../utils/formatCurrency';
import React, { useState, useEffect } from "react";
import { Loader2, ArrowRight, ArrowLeft, XCircle, Zap, Droplets, Flame, Wifi, Smartphone, MapPin, Building2, User, AlertCircle } from "lucide-react";
import { PinPrompt } from "./PinPrompt";
import { toast } from "sonner";

interface UtilityBillPaymentProps {
  type: string;
  onBack: () => void;
  bankDetails: { name: string; account: string } | null;
}

export const UtilityBillPayment = ({ type, onBack, bankDetails }: UtilityBillPaymentProps) => {
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [step, setStep] = useState<"state" | "provider" | "account" | "fetching" | "plans" | "bill" | "pin" | "processing" | "success">("state");
  const [state, setState] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "bnpl">("bank");
  const [bnplTenure, setBnplTenure] = useState<number>(3);
  useEffect(() => {
    setUserBalance(getBalance());
    const handleUpdate = (e: any) => setUserBalance(e.detail);
    window.addEventListener('balance_updated', handleUpdate);
    return () => window.removeEventListener('balance_updated', handleUpdate);
  }, []);

  const [provider, setProvider] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const billAmount = selectedPlan ? selectedPlan.price : "1245.00";
  
  const getIcon = () => {
    switch (type) {
      case 'electricity': return <Zap className="w-8 h-8 text-yellow-400" />;
      case 'water': return <Droplets className="w-8 h-8 text-blue-400" />;
      case 'gas': return <Flame className="w-8 h-8 text-orange-400" />;
      case 'broadband': return <Wifi className="w-8 h-8 text-indigo-400" />;
      case 'mobile_prepaid':
      case 'mobile_postpaid': return <Smartphone className="w-8 h-8 text-emerald-400" />;
      default: return <Zap className="w-8 h-8 text-indigo-400" />;
    }
  };

  const getTitle = () => {
    if (type === 'mobile_prepaid') return "Mobile Prepaid Recharge";
    if (type === 'mobile_postpaid') return "Mobile Postpaid Bill";
    return type.charAt(0).toUpperCase() + type.slice(1) + " Bill";
  };

  const states = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar","Chandigarh","Dadra and Nagar Haveli","Daman and Diu","Delhi","Lakshadweep","Puducherry"];
  
  const getProviders = () => {
    if (!state) return [];
    if (type === 'electricity') return ["Tata Power", "Adani Electricity", "BSES", `${state} State Electricity Board`, `${state} Power Distribution Company`];
    if (type === 'water') return ["Municipal Corporation", "Jal Board"];
    if (type === 'gas') return ["Indraprastha Gas", "Mahanagar Gas", "Gujarat Gas"];
    if (type === 'broadband') return ["Airtel", "Jio", "ACT", "Excitel"];
    if (type === 'mobile_prepaid' || type === 'mobile_postpaid') return ["Jio", "Airtel", "Vi", "BSNL"];
    return ["Provider A", "Provider B"];
  };

  const getValidationPattern = () => {
    if (provider.includes("Tata")) return { regex: /^\d{12}$/, formatMsg: "12-digit Consumer Number" };
    if (provider.includes("Adani") || provider.includes("BSES")) return { regex: /^\d{9}$/, formatMsg: "9-digit Account Number" };
    if (provider.includes("Municipal") || provider.includes("Jal Board")) return { regex: /^[A-Z0-9]{10}$/i, formatMsg: "10-character KNO" };
    if (provider.includes("Gas")) return { regex: /^\d{10}$/, formatMsg: "10-digit CRN" };
    if (provider.includes("Airtel") || provider.includes("Jio")) return { regex: /^\d{10}$/, formatMsg: "10-digit Mobile/Landline Number" };
    return { regex: /^[A-Z0-9]{8,15}$/i, formatMsg: "8 to 15 alphanumeric characters" };
  };

  const validateAndFetch = (e: React.FormEvent) => {
    e.preventDefault();
    const pattern = getValidationPattern();
    if (!pattern.regex.test(accountNo)) {
      setErrorMsg(`Invalid format. Please enter a valid ${pattern.formatMsg}.`);
      return;
    }
    setErrorMsg("");
    setStep("fetching");
    setTimeout(() => {
      if (type === 'mobile_prepaid' || type === 'mobile_postpaid') {
        setStep("plans");
      } else {
        setStep("bill");
      }
    }, 200);
  };

  const handlePayClick = () => {
    // Fraud Anomaly Detection
    const currentHour = new Date().getHours();
    const isOddHour = currentHour >= 0 && currentHour < 5;
    const amt = Number(billAmount) || 0;
    const isLargeTransaction = amt > 10000;
    
    if (isLargeTransaction && isOddHour) {
      toast.warning("Fraud Alert: Unusually large transaction detected at an odd hour. Proceed with caution.", {
        icon: '🚨',
        duration: 5000,
        style: { background: '#7f1d1d', color: '#fecaca', borderColor: '#ef4444' }
      });
    } else if (isLargeTransaction) {
      toast.warning("Security Notice: Large transaction detected.", {
        icon: '🛡️',
        duration: 3000
      });
    }

    if (paymentMethod === "bank" && amt > userBalance) {
      toast.error(`Low Balance Warning! Your balance is ${formatCurrency(userBalance)}, which is less than the bill amount.`, { icon: "⚠️", style: { background: "#450a0a", color: "#fecaca", borderColor: "#7f1d1d" }});
    }
    setStep("pin");
  };

  const processPayment = () => {
    if (paymentMethod === "bank") {
      const deduction = deductBalance(Number(billAmount));
      if (!deduction.success) {
        toast.error("Payment Failed: " + (deduction.reason || "Insufficient balance."), {
          icon: '❌',
          style: { background: '#450a0a', color: '#fecaca', borderColor: '#7f1d1d' }
        });
        setStep("bill");
        return;
      }
    }
    toast.loading("Processing bill payment...", { id: "bill-status" });
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      toast.success(`Successfully paid ${formatCurrency(billAmount)} to ${provider} for ${getTitle()}`, { id: "bill-status", style: { background: "#052e16", color: "#bbf7d0", borderColor: "#14532d" }});
      
      const tx = {
        type: 'sent',
        amount: billAmount,
        recipient: `${provider} (${getTitle()})`,
        date: new Date().toISOString(),
        method: paymentMethod === "bnpl" ? `BNPL (${bnplTenure}m)` : "UPI"
      };
      const saved = localStorage.getItem('swiftpay_history');
      const history = saved ? JSON.parse(saved) : [];
      history.unshift(tx);
      localStorage.setItem('swiftpay_history', JSON.stringify(history));
    }, 200);
  };

  if (step === "pin") {
    return (
      <PinPrompt 
        amount={billAmount} 
        onSuccess={processPayment} 
        onCancel={() => setStep("bill")} 
      />
    );
  }

  if (step === "success") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 w-full max-w-sm mx-auto h-full text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Bill Paid Successfully!</h3>
        <p className="text-slate-400 mb-8">{formatCurrency(billAmount)} paid to {provider}</p>
        <button 
          onClick={onBack}
          className="bg-slate-800 hover:bg-slate-700 text-white py-3 px-8 rounded-xl font-bold transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
        <p className="text-slate-400">Securely paying {formatCurrency(billAmount)} via {bankDetails?.name || 'Bank'}</p>
      </div>
    );
  }

  if (step === "bill") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 w-full max-w-sm mx-auto h-full">
        <div className="bg-slate-900 rounded-3xl w-full p-6 text-white border border-slate-800 shadow-2xl relative">
          <button 
            onClick={() => setStep("account")}
            className="absolute left-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          
          <div className="flex items-center justify-center gap-3 border-b border-slate-800 pb-4 mb-6 pt-2">
             {getIcon()}
             <h2 className="text-xl font-bold">{getTitle()}</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Consumer Name</span>
              <span className="font-semibold text-sm">Rohit Jangra</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Provider</span>
              <span className="font-semibold text-sm">{provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Account</span>
              <span className="font-semibold text-sm">{accountNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Due Date</span>
              <span className="font-semibold text-red-400 text-sm">15 Jul 2026</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-800">
              <span className="text-slate-400 font-medium">Bill Amount</span>
              <span className="font-bold text-xl text-white">{formatCurrency(billAmount)}</span>
            </div>
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
                    <span className="font-normal opacity-80">{formatCurrency((Number(billAmount) || 0) / m)}/mo</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button 
            onClick={handlePayClick}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            Pay {formatCurrency(billAmount)}
          </button>
        </div>
      </div>
    );
  }

  if (step === "fetching") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full animate-in fade-in duration-300 text-center">
        <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
           {getIcon()}
           <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1">
             <Loader2 className="w-4 h-4 text-white animate-spin" />
           </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Fetching Bill Details...</h3>
        <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Connecting to {provider} bill desk securely</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto h-full flex flex-col pt-8 animate-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-8 relative">
        {(step === "provider" || step === "account") && (
          <button 
            onClick={() => step === "provider" ? setStep("state") : setStep("provider")}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors z-10"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
        )}
        <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20">
          {getIcon()}
        </div>
        <h3 className="text-xl font-bold text-white">Pay {getTitle()}</h3>
        <p className="text-slate-400 text-sm mt-1">
          {step === "state" ? "Select your state" : step === "provider" ? "Select your provider" : "Enter account details"}
        </p>
      </div>
      
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex-1 flex flex-col relative overflow-hidden shadow-2xl">
        {step === "state" && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-3 mb-2 flex-1 overflow-y-auto max-h-[350px] pr-2">
              {states.map(s => (
                <button
                  key={s}
                  onClick={() => { setState(s); setProvider(""); setStep("provider"); setErrorMsg(""); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-slate-800 ${state === s ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-5 h-5 ${state === s ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="font-medium">{s}</span>
                  </div>
                  {state === s && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "provider" && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-3 mb-2 flex-1 overflow-y-auto max-h-[350px] pr-2">
              {getProviders().map(p => (
                <button
                  key={p}
                  onClick={() => { setProvider(p); setStep("account"); setErrorMsg(""); }}
                  className={`w-full flex items-center p-4 rounded-xl border transition-all hover:bg-slate-800 ${provider === p ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                >
                  <Building2 className={`w-5 h-5 mr-3 shrink-0 ${provider === p ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="font-medium text-sm text-left leading-tight">{p}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "account" && (
          <form onSubmit={validateAndFetch} className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-5 mb-8 flex-1">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-2">
                <span className="block text-white font-medium mb-1 text-sm">{provider}</span>
                <span className="text-xs text-slate-400">Please enter your {getValidationPattern().formatMsg}.</span>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-1 block">
                  Consumer / Account Number
                </label>
                <div className="relative">
                  <input 
                    required
                    autoFocus
                    type="text"
                    placeholder="e.g. 1029384756"
                    className={`w-full bg-slate-950 border ${errorMsg ? 'border-red-500' : 'border-slate-800'} rounded-xl pl-10 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-medium text-sm`}
                    value={accountNo}
                    onChange={(e) => {
                      setAccountNo(e.target.value.toUpperCase());
                      setErrorMsg("");
                    }}
                  />
                  <User className="absolute left-3.5 top-4 w-4 h-4 text-slate-500" />
                </div>
                {errorMsg && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
                  </p>
                )}
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={!accountNo}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-auto"
            >
              Fetch Bill <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
