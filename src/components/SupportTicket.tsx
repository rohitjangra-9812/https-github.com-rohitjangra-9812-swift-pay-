import React, { useState } from 'react';
import { Mail, MessageSquare, Send, ArrowLeft, Loader2, CheckCircle2, HeadphonesIcon } from 'lucide-react';
import { toast } from 'sonner';

export const SupportTicket = ({ onBack }: { onBack: () => void }) => {
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle || !issueDescription) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Support ticket raised successfully");
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="absolute inset-0 z-[60] bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Ticket Submitted</h2>
        <p className="text-slate-400 mb-8 max-w-xs">
          Our team is reviewing your issue. You will receive an update at your registered email address shortly.
        </p>
        <button 
          onClick={onBack}
          className="w-full max-w-xs bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold text-white transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[60] bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-white">24/7 Support</h2>
          <p className="text-xs text-slate-400">We're here to help</p>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4 mb-8">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
            <HeadphonesIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-100 text-sm">Direct Email Support</h3>
            <p className="text-xs text-indigo-200/70 mt-1 mb-2 leading-relaxed">
              For immediate assistance, you can always reach our dedicated support desk directly via email.
            </p>
            <a href="mailto:rohitjangra2782@gmail.com" className="inline-flex items-center gap-1.5 text-indigo-400 text-sm font-bold bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-500/30">
              <Mail className="w-4 h-4" /> rohitjangra2782@gmail.com
            </a>
          </div>
        </div>

        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 px-1">
          Raise a Ticket
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Issue Type</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                required
              >
                <option value="" disabled>Select the type of issue</option>
                <option value="Payment Failed">Payment Failed</option>
                <option value="Money Deducted but not Received">Money Deducted but not Received</option>
                <option value="Fraudulent Transaction">Fraudulent Transaction</option>
                <option value="Account Blocked">Account Blocked</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-1 mb-1 block">Description</label>
            <div className="relative">
              <textarea 
                required
                rows={4}
                placeholder="Please describe your issue in detail..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
              <MessageSquare className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !issueTitle || !issueDescription}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 py-4 rounded-xl font-bold mt-2 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              <>Submit Ticket <Send className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
