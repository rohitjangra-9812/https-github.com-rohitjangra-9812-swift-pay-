import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export const MerchantAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d

  // Mock data for analytics
  const totalSales = 145000;
  const successRate = 96.5;
  const peakHour = "14:00 - 15:00";
  const transactionCount = 342;
  const successfulTx = 330;
  const failedTx = 12;

  // Mock chart heights for 7 days
  const chartData = [40, 70, 45, 90, 60, 85, 100];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Business Analytics
        </h3>
        <div className="flex gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
          {['24h', '7d', '30d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors ${
                timeRange === range ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-3xl p-5 shadow-sm">
        <p className="text-[10px] text-emerald-200/70 uppercase tracking-wider mb-1">Total Sales ({timeRange})</p>
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-black text-white">{formatCurrency(totalSales)}</h2>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">
            <TrendingUp className="w-3 h-3" /> +12%
          </div>
        </div>

        {/* Mini Bar Chart */}
        <div className="h-16 flex items-end justify-between gap-1.5 mt-6">
          {chartData.map((height, i) => (
            <div key={i} className="w-full bg-slate-800/50 rounded-t-sm relative group h-full flex flex-col justify-end">
              <div 
                className="w-full bg-emerald-500/80 rounded-t-sm transition-all duration-500 group-hover:bg-emerald-400" 
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Peak Hours */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Peak Hours</p>
          </div>
          <p className="text-lg font-black text-white">{peakHour}</p>
          <p className="text-[9px] text-slate-500 mt-1">Highest transaction volume</p>
        </div>

        {/* Success Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Success Rate</p>
          </div>
          <p className="text-lg font-black text-white">{successRate}%</p>
          <p className="text-[9px] text-slate-500 mt-1">Based on {transactionCount} txns</p>
        </div>
      </div>

      {/* Transaction Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
        <h4 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-slate-400" />
          Transaction Ratio
        </h4>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">Successful</span>
              </div>
              <span className="text-xs font-bold text-white">{successfulTx}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(successfulTx/transactionCount)*100}%` }} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-bold text-slate-300">Failed</span>
              </div>
              <span className="text-xs font-bold text-white">{failedTx}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500" style={{ width: `${(failedTx/transactionCount)*100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
