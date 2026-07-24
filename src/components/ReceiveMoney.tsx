import { addBalance } from '../utils/balanceManager';
import { syncBankAccountState } from '../utils/backupSync';
import { formatCurrency } from '../utils/formatCurrency';
import React, { useState, useEffect } from "react";
import { ArrowLeft, QrCode, Copy, Share2, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

export const ReceiveMoney = ({ onBack, bankDetails }: { onBack: () => void, bankDetails: any }) => {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    // Generate UPI ID based on a mock verified mobile number and bank
    const mobile = localStorage.getItem("swiftpay_verified_mobile") || "9876543210";
    setUpiId(`${mobile}@swiftpay`);
  }, []);

  const handleShare = async () => {
    try {
      const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
      if (canvas) {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const file = new File([blob], `SwiftPay-QR-${amount ? amount + '-INR' : 'Receive'}.png`, { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'My SwiftPay QR',
              text: `Pay me via SwiftPay UPI: ${upiId}${amount ? ` for ${formatCurrency(amount)}` : ''}`,
            });
            return;
          }
        }
        
        // Fallback to download if canShare files is not supported
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `SwiftPay-QR-${amount ? amount + '-INR' : 'Receive'}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('QR Code Image Downloaded!');
      }

      const shareData = {
        title: 'My SwiftPay QR',
        text: `Pay me via SwiftPay UPI: ${upiId}${amount ? ` for ${formatCurrency(amount)}` : ''}`,
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    toast.success('UPI ID copied to clipboard!');
  };

  return (
    <div className="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex flex-col p-6 overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
      <div className="flex items-center gap-4 mb-8 pt-2">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors border border-slate-700/50 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-xl font-bold text-white">Receive Money</h2>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* QR Code Card */}
        <div className="bg-white p-6 rounded-3xl w-full max-w-sm mb-6 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-6">
            <h3 className="text-slate-900 font-bold text-lg mb-1">{bankDetails?.accountName || "User"}</h3>
            <button 
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100 cursor-pointer w-full group"
              title="Tap to copy UPI ID"
            >
              <span className="text-slate-600 font-semibold tracking-wide">{upiId}</span>
              <Copy className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </button>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-2">Tap to copy</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center aspect-square border-2 border-dashed border-slate-200 mb-6 relative">
            <QRCodeCanvas 
              id="qr-code-canvas"
              value={`upi://pay?pa=${upiId}&pn=${encodeURIComponent(bankDetails?.accountName || "User")}${amount ? `&am=${amount}` : ''}`}
              size={192}
              level="H"
              includeMargin={true}
              className="w-48 h-48 text-slate-800"
            />
            {amount && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-slate-100 font-bold text-indigo-600 flex items-center gap-1">
                {formatCurrency(amount)}
              </div>
            )}
          </div>

          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">SwiftPay Network</p>
        </div>

        {/* Set Amount Input */}
        <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-5 border border-slate-800 mb-6">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
            Request Specific Amount (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">{formatCurrency(0).replace(/[0-9.]/g, '')}</span>
            <input 
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 transition-colors font-medium text-lg"
            />
          </div>
        </div>

        <button 
          onClick={() => {
             const amt = amount ? Number(amount) : Math.floor(Math.random() * 5000) + 100;
             addBalance(amt);
             
             // Save history
             const tx = {
                id: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                type: 'received',
                amount: amt,
                recipient: 'Incoming Transfer',
                date: new Date().toISOString(),
                method: 'UPI_QR'
             };
             const saved = localStorage.getItem('swiftpay_history');
             const history = saved ? JSON.parse(saved) : [];
             history.unshift(tx);
             localStorage.setItem('swiftpay_history', JSON.stringify(history));
             window.dispatchEvent(new Event('swiftpay_history_updated'));
             syncBankAccountState();
             
             toast.success(`Successfully received ₹${amt}!`, { icon: '💰' });
          }}
          className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mb-3"
        >
          <IndianRupee className="w-5 h-5" /> Simulate Inbound Payment
        </button>
        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" /> Share QR Code
        </button>
      </div>
    </div>
  );
};
