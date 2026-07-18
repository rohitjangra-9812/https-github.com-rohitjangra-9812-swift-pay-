import React, { useState, useEffect } from 'react';
import { Gift, Zap, Star, Sparkles, ChevronRight, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { toast } from 'sonner';

export const RewardsProgram = ({ 
  points, 
  onRedeem 
}: { 
  points: number, 
  onRedeem: (pts: number, value: number) => void 
}) => {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/20 rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-400/30">
          <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
        </div>
        <h3 className="text-sm font-bold text-amber-100 uppercase tracking-wider mb-1">SwiftPoints Balance</h3>
        <p className="text-4xl font-black text-amber-400 tracking-tight">{points.toLocaleString()}</p>
        <p className="text-[10px] text-slate-400 mt-2">Earn 1 point for every ₹100 spent</p>
      </div>

      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1 mt-2">Redeem Options</h4>
      
      <div className="grid gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Cashback to Wallet</h4>
              <p className="text-[10px] text-slate-400">1000 points = ₹50</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (points >= 1000) {
                onRedeem(1000, 50);
                toast.success('Redeemed 1000 points for ₹50 cashback!');
              } else {
                toast.error('Not enough points');
              }
            }}
            disabled={points < 1000}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              points >= 1000 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Redeem
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Amazon Gift Card</h4>
              <p className="text-[10px] text-slate-400">5000 points = ₹250</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (points >= 5000) {
                onRedeem(5000, 250);
                toast.success('Redeemed 5000 points for Amazon Gift Card! Sent to email.');
              } else {
                toast.error('Not enough points');
              }
            }}
            disabled={points < 5000}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              points >= 5000 
                ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Redeem
          </button>
        </div>
      </div>
    </div>
  );
};
