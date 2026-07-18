import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, QrCode } from 'lucide-react';

interface GenerateQRProps {
  defaultUpiId?: string;
}

export const GenerateQR: React.FC<GenerateQRProps> = ({ defaultUpiId = '' }) => {
  const [upiId, setUpiId] = useState(defaultUpiId);
  const [amount, setAmount] = useState('');

  // Example UPI URL format: upi://pay?pa=upiId&pn=PayeeName&am=amount&cu=INR
  const generateUpiUrl = () => {
    if (!upiId) return '';
    let url = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=User&cu=INR`;
    if (amount && !isNaN(Number(amount))) {
      url += `&am=${amount}`;
    }
    return url;
  };

  const upiUrl = generateUpiUrl();

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          <QrCode className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Receive Payment
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Show this QR code to receive money
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Your UPI ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. yourname@bank"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Amount (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400 font-medium">₹</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {upiId ? (
          <div className="mt-8 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <QRCodeSVG
                value={upiUrl}
                size={200}
                level="H"
                includeMargin={true}
                className="w-full max-w-[200px] h-auto"
              />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 break-all text-center">
              {upiId}
            </p>
            {amount && (
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                ₹{amount}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Enter a valid UPI ID to generate your QR code
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
