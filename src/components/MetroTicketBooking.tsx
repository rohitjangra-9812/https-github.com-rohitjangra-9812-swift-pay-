import { deductBalance } from '../utils/balanceManager';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/formatCurrency';
import React, { useState } from "react";
import { ArrowLeft, Loader2, MapPin, QrCode, Train, User } from "lucide-react";
import { PinPrompt } from "./PinPrompt";

interface MetroTicketBookingProps {
  onBack: () => void;
  bankDetails: { name: string; account: string } | null;
}

export const MetroTicketBooking = ({ onBack, bankDetails }: MetroTicketBookingProps) => {
  const [step, setStep] = useState<"book" | "pin" | "processing" | "ticket">("book");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [passengers, setPassengers] = useState(1);
  
  const stations = [
    "Rajiv Chowk", "Kashmere Gate", "Hauz Khas", "Botanical Garden",
    "Sector 52 Noida", "Huda City Centre", "Janakpuri West", "Lajpat Nagar"
  ];

  const pricePerTicket = 40;
  const totalAmount = passengers * pricePerTicket;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination || source === destination) return;
    setStep("pin");
  };

  const processPayment = () => {
    const deduction = deductBalance(totalAmount);
    if (!deduction.success) {
      toast.error("Payment Failed: " + (deduction.reason || "Insufficient balance."), {
        icon: '❌',
        style: { background: '#450a0a', color: '#fecaca', borderColor: '#7f1d1d' }
      });
      setStep("booking");
      return;
    }
    setStep("processing");
    setTimeout(() => {
      setStep("ticket");
      
      const tx = {
        type: 'sent',
        amount: totalAmount.toString(),
        recipient: `Metro: ${source} to ${destination}`,
        date: new Date().toISOString(),
        method: "UPI"
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
        amount={totalAmount.toString()} 
        onSuccess={processPayment} 
        onCancel={() => setStep("book")} 
      />
    );
  }

  if (step === "processing") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Processing Payment...</h3>
        <p className="text-slate-400">Paying {formatCurrency(totalAmount)} via {bankDetails?.name || 'Bank'}</p>
      </div>
    );
  }

  if (step === "ticket") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-3xl w-full p-6 text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-4 bg-indigo-600"></div>
          
          <div className="flex items-center justify-between mb-6 pt-4 border-b border-dashed border-slate-300 pb-4">
            <div>
              <h2 className="font-black text-2xl tracking-tighter text-indigo-900">METRO</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">E-Ticket</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Train className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 border-indigo-600 bg-white"></div>
                <div className="w-0.5 h-8 bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">From</p>
                  <p className="font-bold text-slate-800">{source}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">To</p>
                  <p className="font-bold text-slate-800">{destination}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-y border-dashed border-slate-300 py-4 mb-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Passengers</p>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-slate-700" />
                <span className="font-bold text-slate-800 text-lg">{passengers}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Paid</p>
              <p className="font-black text-slate-900 text-xl">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center opacity-80">
            <QrCode className="w-32 h-32 text-slate-900" />
            <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Scan at Entry Gate</p>
          </div>
          
          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-950 rounded-full"></div>
          <div className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-950 rounded-full"></div>
        </div>
        
        <button 
          onClick={onBack}
          className="mt-8 bg-slate-800 hover:bg-slate-700 text-white py-3 px-8 rounded-xl font-bold transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto h-full flex flex-col">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-900 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Train className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Book Metro Ticket</h3>
        <p className="text-slate-400 text-sm mt-1">Select your route</p>
      </div>
      
      <form onSubmit={handleBook} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex-1">
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-1 block">From Station</label>
            <div className="relative">
              <select 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="" disabled>Select Source</option>
                {stations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-1 block">To Station</label>
            <div className="relative">
              <select 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                <option value="" disabled>Select Destination</option>
                {stations.map(s => <option key={s} value={s} disabled={s === source}>{s}</option>)}
              </select>
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-1 block">Passengers</label>
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-2">
              <button 
                type="button"
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center hover:bg-slate-800 text-white font-bold transition-colors"
              >-</button>
              <div className="flex-1 text-center font-bold text-lg text-white">
                {passengers}
              </div>
              <button 
                type="button"
                onClick={() => setPassengers(Math.min(6, passengers + 1))}
                className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center hover:bg-slate-800 text-white font-bold transition-colors"
              >+</button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 font-medium">Total Amount</span>
            <span className="text-xl font-bold text-white">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={!source || !destination || source === destination}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
        >
          Pay & Book Ticket
        </button>
      </form>
    </div>
  );
};
