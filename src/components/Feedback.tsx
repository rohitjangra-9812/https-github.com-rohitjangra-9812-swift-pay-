import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Feedback = ({ onBack }: { onBack: () => void }) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Save feedback to local storage for admin to see
      const existing = JSON.parse(localStorage.getItem('swiftpay_feedbacks') || '[]');
      existing.unshift({
        id: Math.random().toString(36).substring(2, 9),
        text: feedback,
        date: new Date().toISOString(),
        user: localStorage.getItem('swiftpay_verified_mobile') || 'Anonymous'
      });
      localStorage.setItem('swiftpay_feedbacks', JSON.stringify(existing));

      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Feedback submitted successfully!");
    }, 1000);
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 p-6 pb-2 border-b border-slate-900">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors border border-slate-800"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" /> Share Feedback
        </h2>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {submitted ? (
          <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-slate-400">
              Your feedback has been sent directly to the admin team. We appreciate your input to improve SwiftPay.
            </p>
            <button
              onClick={onBack}
              className="mt-8 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <p className="text-sm text-slate-400 mb-6">
              Tell us what needs to be improved, changed, or added to the SwiftPay App.
            </p>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type your feedback here..."
              className="w-full h-48 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none mb-6"
              required
            />
            
            <div className="mt-auto">
              <button
                type="submit"
                disabled={isSubmitting || !feedback.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
