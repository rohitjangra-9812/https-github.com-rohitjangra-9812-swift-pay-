import { formatCurrency } from '../utils/formatCurrency';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import React, { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock, ShieldCheck, Download, X, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export const TransactionHistory = ({ onRepeatPayment }: { onRepeatPayment?: (tx: any) => void }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('swiftpay_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleDownload = () => {
    if (selectedTx) {
      generateReceiptPDF({
        id: selectedTx.id,
        amount: selectedTx.amount,
        recipientName: selectedTx.recipient,
        timestamp: new Date(selectedTx.date).getTime(),
        status: selectedTx.status || "SUCCESS",
        method: selectedTx.method
      });
      toast.success("Receipt generated and downloaded!");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pt-6 -mx-6 px-6 relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
          <Clock className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Transaction History</h2>
          <p className="text-sm text-slate-400">Your personal secure log</p>
        </div>
      </div>
      
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-300">No Transactions Yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-[200px]">Your transactions will appear here securely.</p>
        </div>
      ) : (
        <div className="space-y-4 pb-6">
          {history.map((tx, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedTx(tx)}
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'sent' ? 'bg-indigo-500/10' : 'bg-green-500/10'}`}>
                  {tx.type === 'sent' ? (
                    <ArrowUpRight className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{tx.recipient || tx.merchant || "Unknown"}</h4>
                  <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()} • {tx.method || "Transfer"}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold ${tx.type === 'sent' ? 'text-white' : 'text-green-400'}`}>
                  {tx.type === 'sent' ? '-' : '+'}{formatCurrency(tx.amount)}
                </span>
                <p className="text-[10px] text-slate-500 uppercase flex items-center justify-end gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> Secured
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTx && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Receipt Header */}
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Payment Receipt</h3>
                <p className="text-xs text-slate-500">SwiftPay Secure Network</p>
              </div>
              <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            {/* Receipt Body */}
            <div className="p-6 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] rotate-[-25deg]">
                <h2 className="text-xl font-black text-center leading-tight whitespace-nowrap">
                  <span className="text-indigo-600">WELCOME TO THE</span><br/>
                  <span className="text-emerald-600">ROHIT JANGRA</span><br/>
                  <span className="text-purple-600">APP</span>
                </h2>
              </div>
              <div className="relative z-10 text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-slate-800">{formatCurrency(selectedTx.amount)}</h2>
                <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider mt-1">Transaction Successful</p>
              </div>
              
              <div className="space-y-4 text-sm mb-8">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">To/From</span>
                  <span className="font-bold">{selectedTx.recipient || selectedTx.merchant || "Unknown"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Date</span>
                  <span className="font-bold">{new Date(selectedTx.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Method</span>
                  <span className="font-bold">{selectedTx.method || "Transfer"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-bold font-mono text-xs">TXN{Math.random().toString().substring(2, 10).toUpperCase()}</span>
                </div>
              </div>

              {/* Signature and Stamp Area */}
              <div className="flex items-end justify-between mt-8 relative border-t border-slate-200 pt-6">
                <div className="absolute top-2 right-4 transform rotate-12 opacity-80 pointer-events-none">
                  <div className="border-4 border-red-500 text-red-500 font-black uppercase tracking-widest px-2 py-1 text-sm rounded-sm">
                    ADMIN VERIFIED
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  {/* Cursive-style signature for Rohit Jangra */}
                  <span className="font-['Brush_Script_MT',cursive,serif] text-2xl text-slate-800 -mb-2 italic">
                    Rohit Jangra
                  </span>
                  <span className="w-32 border-b border-slate-400 mt-2 mb-1"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Authorized Signature</span>
                </div>
              </div>
            </div>

                        {/* Receipt Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button 
                onClick={handleDownload}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              {selectedTx.type === 'sent' && onRepeatPayment && (
                <button
                  onClick={() => {
                    onRepeatPayment(selectedTx);
                    setSelectedTx(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" /> Repeat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
