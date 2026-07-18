import { formatCurrency } from '../utils/formatCurrency';
import React, { useState } from "react";
import { ArrowLeft, Clock, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const AutoPaySetup = ({ onBack, bankDetails }: { onBack: () => void, bankDetails: any }) => {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [recipient, setRecipient] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || (!accountNo && !mobile)) {
      toast.error("Please fill all required details.");
      return;
    }
    setStep("processing");
    setTimeout(() => {
      setStep("success");
    }, 200);
  };

  if (step === "success") {
    return (
      <div className="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex flex-col p-6 animate-in fade-in duration-300">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">AutoPay Configured!</h2>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">
            {formatCurrency(amount)} will be automatically deducted at the end of every month for {recipient || mobile}.
          </p>
          <button 
            onClick={onBack}
            className="w-full max-w-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex flex-col p-6 overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
      <div className="flex items-center gap-4 mb-8 pt-2">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors border border-slate-700/50 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-xl font-bold text-white">Setup Recurring AutoPay</h2>
      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6 flex gap-3">
        <Clock className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <p className="text-xs text-orange-200/80 leading-relaxed">
          Set up automatic payments at the end of each month. Your account will be debited automatically. Cancel anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Recipient Name</label>
          <input 
            type="text" placeholder="Who are you paying?" required
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            value={recipient} onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Account No</label>
            <input 
              type="text" placeholder="Account No"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={accountNo} onChange={(e) => setAccountNo(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">IFSC Code</label>
            <input 
              type="text" placeholder="IFSC"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={ifsc} onChange={(e) => setIfsc(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-center my-2">
          <div className="border-t border-slate-800 flex-1"></div>
          <span className="text-xs text-slate-500 font-bold px-3 uppercase">OR</span>
          <div className="border-t border-slate-800 flex-1"></div>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Mobile Number (UPI)</label>
          <input 
            type="tel" placeholder="Mobile Number"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            value={mobile} onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block mt-2">Monthly Deduction Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{formatCurrency(0).replace(/[0-9.]/g, '')}</span>
            <input 
              type="number" placeholder="0.00" required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-bold text-lg"
              value={amount} onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={step === "processing"}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all mt-6 shadow-lg shadow-indigo-600/20"
        >
          {step === "processing" ? "Configuring..." : "Setup AutoPay"}
        </button>
      </form>
    </div>
  );
};
