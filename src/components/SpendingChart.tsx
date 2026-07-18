import { formatCurrency } from '../utils/formatCurrency';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { name: 'Mon', spend: 1200 },
  { name: 'Tue', spend: 800 },
  { name: 'Wed', spend: 2500 },
  { name: 'Thu', spend: 1050 },
  { name: 'Fri', spend: 400 },
  { name: 'Sat', spend: 3100 },
  { name: 'Sun', spend: 1800 },
];

export const SpendingChart = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-8 shadow-sm">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
        Weekly Spending
      </h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrency(val)} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area type="monotone" dataKey="spend" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
