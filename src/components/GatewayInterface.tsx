import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export const GatewayInterface = () => {
  const [view, setView] = useState('selection'); // 'selection', 'details', 'utilities'
  const [searchQuery, setSearchQuery] = useState('');

  const utilities = ['Electricity', 'Mobile', 'Insurance', 'Metro', 'Water'];
  const filteredUtilities = utilities.filter(service => 
    service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg mt-8 border border-slate-800">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        Payment & Utility Hub
      </h2>
      
      {/* 1. Payment Source Selection */}
      {view === 'selection' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => setView('details')} className="p-4 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg font-medium shadow-md">QR Code</button>
          <button onClick={() => setView('details')} className="p-4 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg font-medium shadow-md">UPI ID</button>
          <button onClick={() => setView('details')} className="p-4 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg font-medium shadow-md">Self Account</button>
        </div>
      )}

      {/* 2. Details View */}
      {view === 'details' && (
        <div className="border border-indigo-500/30 p-6 rounded-lg bg-slate-800/50">
          <h3 className="text-lg font-semibold text-indigo-300">Account Holder Details</h3>
          <div className="my-6 p-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-slate-400"> 
            [QR Code Image Here] 
          </div>
          <p className="font-mono text-slate-300">Account Number: XXXX-XXXX-1234</p>
          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setView('selection')} className="text-sm text-slate-400 hover:text-white transition-colors">
              &larr; Back
            </button>
            <button onClick={() => setView('utilities')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg text-sm font-medium shadow-md">
              Continue to Utilities &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 3. Utility Bills Dashboard */}
      {view === 'utilities' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-indigo-300">Utility Bills</h3>
            <button onClick={() => setView('details')} className="text-sm text-slate-400 hover:text-white transition-colors">
              &larr; Back
            </button>
          </div>
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search utilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredUtilities.length > 0 ? (
              filteredUtilities.map(service => (
                <div key={service} className="p-4 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer rounded-lg text-center text-sm font-medium">
                  {service}
                </div>
              ))
            ) : (
              <div className="col-span-2 sm:col-span-3 text-center py-8 text-slate-400 text-sm">
                No utilities found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
