import { formatCurrency } from '../utils/formatCurrency';
import React, { useRef } from 'react';
import { CheckCircle2, Share2, Download, Receipt } from 'lucide-react';
import { motion } from 'motion/react';

interface TransactionReceiptProps {
  paymentId: string;
  orderId: string;
  amount: number;
  customerName: string;
  timestamp: string;
  onClose?: () => void;
}

export const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  paymentId,
  orderId,
  amount,
  customerName,
  timestamp,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Transaction Receipt',
          text: `Receipt for payment of ${formatCurrency(amount)} (Txn: ${paymentId})`,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      alert('Sharing is not supported on this device/browser.');
    }
  };

  const handleDownload = () => {
    // In a real app, we'd use html2canvas or similar to generate an image
    alert('Downloading receipt (Mock implementation)');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-sm">
        {/* Receipt Card */}
        <div 
          ref={receiptRef}
          className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Top Zig Zag or decoration */}
          <div className="h-4 w-full bg-[radial-gradient(circle,transparent_50%,#fff_50%)] dark:bg-[radial-gradient(circle,transparent_50%,#0f172a_50%)] bg-[length:16px_16px] absolute top-[-8px] rotate-180" />
          
          <div className="p-8 pt-10 flex flex-col items-center border-b border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Payment Successful</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Thank you for your transaction</p>
            
            <div className="mt-6 mb-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{formatCurrency(amount)}</span>
            </div>
          </div>

          <div className="p-8 space-y-4 text-sm bg-slate-50 dark:bg-slate-950/50">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full text-xs">COMPLETED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Customer Name</span>
              <span className="font-bold text-slate-900 dark:text-white">{customerName || 'Guest User'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Transaction ID</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{paymentId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Order Ref</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Date & Time</span>
              <span className="font-bold text-slate-900 dark:text-white">{timestamp}</span>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center">
              <div className="font-['Dancing_Script',cursive] text-3xl text-slate-800 dark:text-slate-300 transform -rotate-2 opacity-80">
                Rohit Jangra
              </div>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mt-2">Authorized Signatory</span>
            </div>
          </div>
          
          {/* Bottom Zig Zag */}
          <div className="h-4 w-full bg-[radial-gradient(circle,transparent_50%,#fff_50%)] dark:bg-[radial-gradient(circle,transparent_50%,#0f172a_50%)] bg-[length:16px_16px] absolute bottom-[-8px]" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleShare}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Save
          </button>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="w-full mt-4 py-3 text-slate-400 hover:text-white font-medium text-xs tracking-wide transition-colors"
          >
            Back to Dashboard
          </button>
        )}
      </div>
    </motion.div>
  );
};
