import { formatCurrency } from '../utils/formatCurrency';
import React from "react";
import { CheckCircle2, Download } from "lucide-react";
import { generateReceiptPDF } from '../utils/pdfGenerator';

interface PaymentSuccessProps {
  amount?: string;
  recipient?: string;
  transactionId?: string;
  timestamp?: number;
}

export const PaymentSuccess = ({ amount, recipient, transactionId, timestamp }: PaymentSuccessProps) => {
  const handleDownloadReceipt = () => {
    generateReceiptPDF({
      id: transactionId || "TXN" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      amount: amount ? parseFloat(amount) : 0,
      recipientName: recipient || "Unknown",
      timestamp: timestamp || Date.now(),
      status: "SUCCESS"
    });
  };

  return (
    <div className="flex flex-col items-center animate-in zoom-in-50 duration-500 w-full max-w-xs mx-auto">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-[bounce_1s_ease-in-out_infinite]">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
      <p className="text-slate-400 text-center mb-8">
        {amount && recipient ? `${formatCurrency(amount)} paid to ${recipient} securely.` : "Payment completed securely."}
      </p>
      
      <button 
        onClick={handleDownloadReceipt}
        className="flex items-center justify-center gap-2 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700 active:scale-95"
      >
        <Download className="w-5 h-5" />
        Download Receipt
      </button>
    </div>
  );
};
