import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Ticket, X } from 'lucide-react';
import { toast } from 'sonner';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: any[];
}

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({ isOpen, onClose, bankAccounts }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket'>('chat');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Simulate sending
    toast.success(
      activeTab === 'chat' 
        ? "Chat initiated. An agent will connect with you shortly." 
        : "Support ticket submitted successfully."
    );
    
    setTimeout(() => {
      onClose();
      setMessage('');
    }, 1000);
  };

  const getBankReferenceText = () => {
    if (!bankAccounts || bankAccounts.length === 0) return "No linked accounts";
    return bankAccounts.map(b => `${b.bankName} (..${(b.accountNumber || '').slice(-4)})`).join(', ');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Help</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex p-2 gap-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'chat' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Live Chat
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ticket' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Support Ticket
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          {bankAccounts && bankAccounts.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Reference Accounts
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {getBankReferenceText()}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {activeTab === 'chat' ? 'How can we help you today?' : 'Describe your issue'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={activeTab === 'chat' ? "Type your message..." : "Please provide details about the issue..."}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {activeTab === 'chat' ? (
              <>
                <MessageSquare className="w-4 h-4" />
                Start Chat
              </>
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                Submit Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
