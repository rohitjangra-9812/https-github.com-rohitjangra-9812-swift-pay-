import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play, 
  Calendar, 
  User, 
  Tag, 
  Smartphone, 
  CreditCard, 
  DollarSign, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { cn } from '../utils';

export interface QuickPayItem {
  id: string;
  name: string; // e.g. "Monthly Rent", "Netflix"
  recipientName: string;
  recipientType: 'UPI' | 'MOBILE' | 'ACCOUNT';
  recipientValue: string; // VPA or Mobile number or Bank account number
  ifsc?: string;
  bankName?: string;
  amount: number;
  note?: string;
  frequency: 'Monthly' | 'Weekly' | 'Daily' | 'Quarterly';
  tag?: string;
  createdAt: number;
}

interface QuickPayRecurringProps {
  items: QuickPayItem[];
  allTags: string[];
  onAddQuickPay: (item: Omit<QuickPayItem, 'id' | 'createdAt'>) => void;
  onDeleteQuickPay: (id: string) => void;
  onTriggerQuickPay: (item: QuickPayItem) => void;
  currencySymbol?: string;
}

export function QuickPayRecurring({
  items,
  allTags,
  onAddQuickPay,
  onDeleteQuickPay,
  onTriggerQuickPay,
  currencySymbol = "₹"
}: QuickPayRecurringProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientType, setRecipientType] = useState<'UPI' | 'MOBILE' | 'ACCOUNT'>('UPI');
  const [recipientValue, setRecipientValue] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('STATE BANK OF INDIA');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Weekly' | 'Daily' | 'Quarterly'>('Monthly');
  const [selectedTag, setSelectedTag] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!name.trim()) return setError("Please enter a name/title for this recurring payment");
    if (!recipientName.trim()) return setError("Please enter recipient's name");
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return setError("Please enter a valid amount greater than 0");
    }

    if (recipientType === 'UPI') {
      const validHandles = ["ybl", "okhdfcbank", "okaxis", "oksbi", "okicici", "paytm", "axl", "ibl", "sib", "api"];
      const [, handle] = recipientValue.split("@");
      if (!handle || !validHandles.includes(handle.toLowerCase())) {
        return setError("Please enter a valid UPI ID with a known bank handle (e.g. name@okaxis)");
      }
      if (recipientValue.toLowerCase().startsWith("invalid") || recipientValue.toLowerCase().startsWith("fake")) {
        return setError("UPI ID does not exist or is not registered.");
      }
    } else if (recipientType === 'MOBILE') {
      const clean = recipientValue.replace(/[^0-9]/g, '');
      if (clean.length < 10) {
        return setError("Please enter a valid 10-digit mobile number");
      }
    } else if (recipientType === 'ACCOUNT') {
      if (recipientValue.trim().length < 8) {
        return setError("Bank account must be at least 8 digits");
      }
      if (ifsc.trim().length !== 11) {
        return setError("IFSC code must be exactly 11 characters");
      }
    }

    onAddQuickPay({
      name: name.trim(),
      recipientName: recipientName.trim(),
      recipientType,
      recipientValue: recipientValue.trim(),
      ifsc: recipientType === 'ACCOUNT' ? ifsc.toUpperCase() : undefined,
      bankName: recipientType === 'ACCOUNT' ? bankName : undefined,
      amount: numAmount,
      frequency,
      tag: selectedTag || undefined,
      note: note.trim() || undefined
    });

    // Reset Form
    setName('');
    setRecipientName('');
    setRecipientValue('');
    setIfsc('');
    setAmount('');
    setNote('');
    setIsOpen(false);
    
    setSuccess("Quick Pay item created successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs text-left">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0 border border-amber-150/25">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              ⚡ Quick Pay Vault
            </h4>
            <p className="text-[8.5px] text-slate-450 dark:text-slate-550 font-bold">
              One-click execution of recurring bills & transfers
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (allTags.length > 0) setSelectedTag(allTags.filter(t => t !== 'ALL')[0] || '');
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase transition-all cursor-pointer shadow-xs active:scale-95"
        >
          {isOpen ? "Close Form" : <><Plus className="w-3 h-3" /> Save Recurring</>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="mb-4 p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/60 rounded-xl space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase text-slate-400">Payment Alias / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Rent, Broadband, Netflix"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-bold text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase text-slate-400">Recipient Name</label>
                <input
                  type="text"
                  required
                  placeholder="Payee Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-bold text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="text-[8.5px] font-black uppercase text-slate-400 block">Recipient Method</label>
                <div className="flex gap-2">
                  {(['UPI', 'MOBILE', 'ACCOUNT'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setRecipientType(t);
                        setRecipientValue('');
                      }}
                      className={cn(
                        "flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border cursor-pointer",
                        recipientType === t
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      {t === 'UPI' ? 'UPI ID' : t === 'MOBILE' ? 'Mobile No.' : 'Bank Account'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase text-slate-400">
                  {recipientType === 'UPI' ? 'UPI Address' : recipientType === 'MOBILE' ? 'Mobile Number' : 'Account Number'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={recipientType === 'UPI' ? 'username@upi' : recipientType === 'MOBILE' ? '9876543210' : 'Bank Account Number'}
                  value={recipientValue}
                  onChange={(e) => setRecipientValue(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-bold text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {recipientType === 'ACCOUNT' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-black uppercase text-slate-400">IFSC Code</label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      placeholder="SBIN0001234"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-bold text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-[8.5px] font-black uppercase text-slate-400">Bank Name</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-black text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="STATE BANK OF INDIA">STATE BANK OF INDIA</option>
                      <option value="HDFC BANK LIMITED">HDFC BANK LIMITED</option>
                      <option value="ICICI BANK CO">ICICI BANK CO</option>
                      <option value="AXIS BANK CORP">AXIS BANK CORP</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase text-slate-400">Recurring Amount ({currencySymbol})</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="₹ Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-black text-slate-855 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase text-slate-400">Billing Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-black text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Daily">Daily</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase text-slate-400">Associated Category Tag</label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-black text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">No tag</option>
                  {allTags.filter(t => t !== 'ALL').map(tag => (
                    <option key={tag} value={tag}>#{tag}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8.5px] font-black uppercase text-slate-400">Internal Memo / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Subscriptions for workspace"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-bold text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100/30 text-rose-650 dark:text-rose-450 rounded-xl flex items-center gap-1.5 text-[9px] font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer transition-all shadow-xs"
              >
                Save Payment Alias
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Success notifier */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="mb-3 p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/35 text-emerald-600 dark:text-emerald-450 rounded-xl flex items-center gap-1.5 text-[8.5px] font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recurring payment list items */}
      {items.length === 0 ? (
        <div className="p-6 bg-slate-50/30 dark:bg-slate-950/10 border border-dashed border-slate-150 dark:border-slate-800 rounded-xl text-center">
          <Calendar className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-[10px] font-bold text-slate-650 dark:text-slate-400">Your Quick Pay vault is empty</p>
          <p className="text-[8.5px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
            Save regular transfers, monthly bills, and digital subscriptions to trigger them instantly with one click.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-50/30 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/60 p-3 rounded-xl hover:border-slate-200 dark:hover:border-slate-800 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      {item.name}
                    </h5>
                    <p className="text-[9px] font-bold text-slate-450 dark:text-slate-505 flex items-center gap-0.5 mt-0.5">
                      <User className="w-2.5 h-2.5 text-indigo-400" />
                      {item.recipientName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md border border-indigo-100/10 uppercase">
                      {item.frequency}
                    </span>
                    <button
                      onClick={() => onDeleteQuickPay(item.id)}
                      className="p-1 text-slate-350 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-all cursor-pointer"
                      title="Delete Recurring Payment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[8px] text-slate-400 dark:text-slate-505">
                  <span className="font-mono bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                    {item.recipientType === 'UPI' && `${item.recipientValue}`}
                    {item.recipientType === 'MOBILE' && `+91 ${item.recipientValue}`}
                    {item.recipientType === 'ACCOUNT' && `A/C: ${item.recipientValue}`}
                  </span>
                  {item.tag && (
                    <span className="font-black text-indigo-500 flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5" /> #{item.tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Action row with amount and Instant Execute Trigger button */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-850/40 flex items-center justify-between">
                <div>
                  <p className="text-[7.5px] font-black uppercase text-slate-400 tracking-wider">Amount</p>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                    {currencySymbol}{item.amount.toLocaleString('en-IN')}
                  </p>
                </div>

                <button
                  onClick={() => onTriggerQuickPay(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs shadow-amber-500/10"
                >
                  <Play className="w-3 h-3 fill-slate-950" /> Instant Pay
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
