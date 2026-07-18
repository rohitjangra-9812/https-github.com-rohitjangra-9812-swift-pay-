import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PiggyBank, 
  Settings, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Tags, 
  Percent,
  Calendar,
  IndianRupee
} from 'lucide-react';
import { cn } from '../utils';

interface Transaction {
  id: string;
  amount: number;
  tags?: string[];
  status?: string;
  timestamp: number;
  recipientName?: string;
  senderName?: string;
}

interface BudgetLimitsTrackerProps {
  transactions: Transaction[]; // Only SENT transactions to compute actual outbound spending
  allTags: string[];
  categoryBudgets: Record<string, number>;
  onUpdateBudget: (category: string, amount: number) => void;
  onDeleteBudget: (category: string) => void;
  currencySymbol?: string;
}

export function BudgetLimitsTracker({
  transactions,
  allTags,
  categoryBudgets,
  onUpdateBudget,
  onDeleteBudget,
  currencySymbol = "₹"
}: BudgetLimitsTrackerProps) {
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(allTags[0] || 'Food');
  const [customCategory, setCustomCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Compute current month's spending per category
  const monthlyCategorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Initialize spending for all budgeted categories
    Object.keys(categoryBudgets).forEach(cat => {
      spending[cat] = 0;
    });

    // Sum transactions in the current month
    transactions.forEach(tx => {
      // Only count successful outbound transactions (i.e. spending)
      if (tx.status === 'SUCCESS') {
        const txDate = new Date(tx.timestamp);
        if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
          if (tx.tags && Array.isArray(tx.tags)) {
            tx.tags.forEach(tag => {
              const trimmed = tag.trim();
              if (trimmed) {
                if (spending[trimmed] === undefined) {
                  spending[trimmed] = 0;
                }
                spending[trimmed] += tx.amount;
              }
            });
          }
        }
      }
    });

    return spending;
  }, [transactions, categoryBudgets]);

  // Overall budget stats
  const totalBudgeted = useMemo(() => {
    return Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);
  }, [categoryBudgets]);

  const totalSpentInBudgetedCategories = useMemo(() => {
    let sum = 0;
    Object.keys(categoryBudgets).forEach(cat => {
      sum += (monthlyCategorySpending[cat] || 0);
    });
    return sum;
  }, [categoryBudgets, monthlyCategorySpending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = selectedCategory === 'CUSTOM' ? customCategory.trim() : selectedCategory;
    const amount = parseFloat(budgetAmount);

    if (!category) return;
    if (isNaN(amount) || amount <= 0) return;

    onUpdateBudget(category, amount);
    
    setSuccessMessage(`Budget limit of ${currencySymbol}${amount.toLocaleString('en-IN')} successfully set for #${category}!`);
    setTimeout(() => setSuccessMessage(null), 3000);

    setBudgetAmount('');
    setCustomCategory('');
    setIsAddingBudget(false);
  };

  const activeBudgetsCount = Object.keys(categoryBudgets).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs text-left">
      {/* Header section */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shrink-0">
            <PiggyBank className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1">
              Monthly Budgets & Spending Limits
            </h4>
            <p className="text-[8.5px] text-slate-400 dark:text-slate-500 font-bold">
              {activeBudgetsCount === 0 
                ? "No active budget thresholds set" 
                : `${activeBudgetsCount} active category thresholds`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeBudgetsCount > 0 && (
            <span className={cn(
              "text-[8px] font-bold px-2 py-0.5 rounded-full border",
              totalSpentInBudgetedCategories > totalBudgeted
                ? "bg-rose-50 border-rose-100/30 text-rose-600 dark:bg-rose-950/20"
                : "bg-emerald-50 border-emerald-100/30 text-emerald-600 dark:bg-emerald-950/20"
            )}>
              {totalSpentInBudgetedCategories > totalBudgeted ? "Over Budget" : "Under Control"}
            </span>
          )}
          <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Top overview statistics */}
            {activeBudgetsCount > 0 && (
              <div className="mt-4 p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100/40 dark:border-slate-850/40 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Total Monthly Budget</p>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100">
                    {currencySymbol}{totalBudgeted.toLocaleString('en-IN')}
                  </p>
                </div>
                
                {/* Total Progress Ring/Bar context */}
                <div className="flex-1 max-w-[120px] text-right space-y-0.5">
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Total Budget Spent</p>
                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {currencySymbol}{totalSpentInBudgetedCategories.toLocaleString('en-IN')} 
                    <span className="text-[8.5px] font-bold text-slate-400 ml-1">
                      ({totalBudgeted > 0 ? ((totalSpentInBudgetedCategories / totalBudgeted) * 100).toFixed(0) : 0}%)
                    </span>
                  </p>
                  <div className="w-full bg-slate-100 dark:bg-slate-850 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        totalSpentInBudgetedCategories > totalBudgeted 
                          ? "bg-rose-500" 
                          : totalSpentInBudgetedCategories > totalBudgeted * 0.85 
                            ? "bg-amber-500" 
                            : "bg-indigo-600"
                      )}
                      style={{ width: `${Math.min(100, totalBudgeted > 0 ? (totalSpentInBudgetedCategories / totalBudgeted) * 100 : 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Empty state or Budgets progress lists */}
            {activeBudgetsCount === 0 ? (
              <div className="mt-4 p-6 bg-slate-50/30 dark:bg-slate-950/10 rounded-xl border border-dashed border-slate-150 dark:border-slate-800 text-center">
                <PiggyBank className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-650 dark:text-slate-400">No category-level spending limits set yet.</p>
                <p className="text-[8.5px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                  Enforce budget thresholds on custom tags like #Work, #Food, or #Entertainment to stay alerts on overspending.
                </p>
                <button
                  onClick={() => setIsAddingBudget(true)}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-[9px] font-black uppercase transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3 h-3" /> Create First Budget Limit
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {Object.entries(categoryBudgets).map(([category, limitAmount]) => {
                  const spent = monthlyCategorySpending[category] || 0;
                  const ratio = limitAmount > 0 ? spent / limitAmount : 0;
                  const percent = (ratio * 100).toFixed(0);
                  const isOver = spent > limitAmount;
                  const isNear = spent > limitAmount * 0.85 && spent <= limitAmount;

                  return (
                    <div 
                      key={category} 
                      className="bg-slate-50/20 dark:bg-slate-950/5 border border-slate-100/60 dark:border-slate-850/60 p-3 rounded-xl hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-100/10">
                            #{category}
                          </span>
                          {isOver && (
                            <span className="flex items-center gap-0.5 text-[8px] font-black uppercase text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 px-1.5 py-0.2 rounded">
                              <AlertTriangle className="w-2.5 h-2.5" /> Exceeded
                            </span>
                          )}
                          {isNear && (
                            <span className="flex items-center gap-0.5 text-[8px] font-black uppercase text-amber-500 bg-amber-50/50 dark:bg-amber-950/20 px-1.5 py-0.2 rounded">
                              <AlertTriangle className="w-2.5 h-2.5" /> Warning
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] font-black text-slate-850 dark:text-slate-200">
                            {currencySymbol}{spent.toLocaleString('en-IN')}
                            <span className="text-slate-400 font-bold text-[8.5px] ml-0.5"> / {currencySymbol}{limitAmount.toLocaleString('en-IN')}</span>
                          </span>
                          <button
                            onClick={() => onDeleteBudget(category)}
                            className="p-1 text-slate-350 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-all cursor-pointer"
                            title="Remove Budget Limit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="relative w-full bg-slate-100 dark:bg-slate-850 rounded-full h-2.5 overflow-hidden shadow-2xs">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, parseFloat(percent))}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full transition-colors duration-300",
                            isOver 
                              ? "bg-rose-500" 
                              : isNear 
                                ? "bg-amber-500" 
                                : "bg-emerald-500"
                          )}
                        />
                      </div>

                      {/* Details row under progress bar */}
                      <div className="flex justify-between items-center mt-1.5 text-[8px] font-bold text-slate-400 dark:text-slate-505">
                        <span>{percent}% of monthly category threshold consumed</span>
                        <span>
                          {isOver 
                            ? `${currencySymbol}${(spent - limitAmount).toLocaleString('en-IN')} over limit` 
                            : `${currencySymbol}${(limitAmount - spent).toLocaleString('en-IN')} remaining`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline budget creator panel */}
            <AnimatePresence>
              {isAddingBudget ? (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-850/50 space-y-3 text-left"
                >
                  <h5 className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-450">
                    Configure Category Spending Limit
                  </h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-black uppercase text-slate-400">Category Tag</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {allTags.filter(t => t !== 'ALL').map(tag => (
                          <option key={tag} value={tag}>#{tag}</option>
                        ))}
                        <option value="CUSTOM">➕ Custom Tag...</option>
                      </select>
                    </div>

                    {selectedCategory === 'CUSTOM' && (
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-black uppercase text-slate-400">Custom Tag Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Subscriptions"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[9.5px] font-bold text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-black uppercase text-slate-400">Monthly Spending Limit ({currencySymbol})</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9.5px] font-black text-slate-400">{currencySymbol}</span>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 5000"
                          value={budgetAmount}
                          onChange={(e) => setBudgetAmount(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-6 pr-2.5 py-1.5 text-[9.5px] font-black text-slate-850 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingBudget(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer transition-all shadow-xs"
                    >
                      Save Threshold
                    </button>
                  </div>
                </motion.form>
              ) : (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setIsAddingBudget(true);
                      if (allTags.length > 0) {
                        setSelectedCategory(allTags.find(t => t !== 'ALL') || 'Food');
                      } else {
                        setSelectedCategory('CUSTOM');
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase transition-all cursor-pointer border border-indigo-100/20"
                  >
                    <Plus className="w-3 h-3" /> Adjust Budget Limit
                  </button>
                </div>
              )}
            </AnimatePresence>

            {/* Success notification banner */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/35 text-emerald-600 dark:text-emerald-450 rounded-xl flex items-center gap-1.5 text-[8.5px] font-bold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
