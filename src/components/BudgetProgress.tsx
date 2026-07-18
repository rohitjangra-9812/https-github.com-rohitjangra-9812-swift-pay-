import { formatCurrency } from '../utils/formatCurrency';
import React, { useEffect, useState } from 'react';
import { Target, Edit2, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const BudgetProgress = () => {
  const [spentThisMonth, setSpentThisMonth] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    return Number(localStorage.getItem('swiftpay_monthly_budget')) || 20000;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(monthlyBudget.toString());

  const [savingGoal, setSavingGoal] = useState(() => {
    return Number(localStorage.getItem('swiftpay_saving_goal')) || 5000;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoalValue, setEditGoalValue] = useState(savingGoal.toString());

  useEffect(() => {
    const calculateSpent = () => {
      const saved = localStorage.getItem('swiftpay_history');
      if (saved) {
        const history = JSON.parse(saved);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const totalSpent = history.reduce((acc: number, tx: any) => {
          const txDate = new Date(tx.date);
          if (tx.type === 'sent' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear && tx.status !== 'Failed') {
            return acc + Number(tx.amount);
          }
          return acc;
        }, 0);
        
        setSpentThisMonth(totalSpent);
      }
    };
    calculateSpent();
    
    window.addEventListener('swiftpay_history_updated', calculateSpent);
    return () => window.removeEventListener('swiftpay_history_updated', calculateSpent);
  }, []);

  useEffect(() => {
    // Check limits for nudges
    if (monthlyBudget > 0) {
      const progress = (spentThisMonth / monthlyBudget) * 100;
      if (progress >= 90 && progress < 100) {
        toast.warning(`Budget Alert! You've used ${progress.toFixed(0)}% of your monthly budget.`, {
          id: 'budget-nudge',
          icon: '⚠️'
        });
      } else if (progress >= 100) {
        toast.error(`Budget Exceeded! You are over your monthly budget by ${formatCurrency(spentThisMonth - monthlyBudget)}.`, {
          id: 'budget-exceeded',
          icon: '🛑'
        });
      }
    }
  }, [spentThisMonth, monthlyBudget]);

  const saveBudget = () => {
    const newBudget = Number(editValue);
    if (!isNaN(newBudget) && newBudget > 0) {
      setMonthlyBudget(newBudget);
      localStorage.setItem('swiftpay_monthly_budget', newBudget.toString());
      setIsEditing(false);
      toast.success('Monthly budget updated!');
    }
  };

  const saveGoal = () => {
    const newGoal = Number(editGoalValue);
    if (!isNaN(newGoal) && newGoal > 0) {
      setSavingGoal(newGoal);
      localStorage.setItem('swiftpay_saving_goal', newGoal.toString());
      setIsEditingGoal(false);
      toast.success('Saving goal updated!');
    }
  };

  const progressPercentage = Math.min((spentThisMonth / monthlyBudget) * 100, 100);
  
  let progressColor = "bg-emerald-500";
  if (progressPercentage >= 100) {
    progressColor = "bg-red-600 shadow-[0_0_15px_#dc2626]";
  } else if (progressPercentage > 85) {
    progressColor = "bg-red-500 shadow-[0_0_10px_#ef4444]";
  } else if (progressPercentage > 60) {
    progressColor = "bg-amber-500";
  }

  const savedAmount = Math.max(0, monthlyBudget - spentThisMonth);
  const goalProgress = Math.min((savedAmount / savingGoal) * 100, 100);

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Monthly Budget Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-400" />
            Monthly Budget
          </h3>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={editValue} 
                onChange={e => setEditValue(e.target.value)}
                className="bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white w-24 outline-none"
                autoFocus
              />
              <button onClick={saveBudget} className="text-emerald-400 hover:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-indigo-300 transition-colors bg-slate-800/50 px-2.5 py-1 rounded-lg">
              {formatCurrency(monthlyBudget)} <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="mb-2 flex justify-between items-end">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Spent</p>
            <p className="text-2xl font-black text-white">{formatCurrency(spentThisMonth)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Remaining</p>
            <p className={`text-sm font-bold ${progressPercentage >= 100 ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatCurrency(Math.max(monthlyBudget - spentThisMonth, 0))}
            </p>
          </div>
        </div>
        
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mt-3 border border-slate-700/50">
          <div 
            className={`h-full ${progressColor} transition-all duration-1000 ease-out`} 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-[10px] text-slate-500 font-medium">
            {progressPercentage.toFixed(1)}% used
          </p>
          {progressPercentage > 85 && (
            <p className={`text-[10px] font-bold flex items-center gap-1 ${progressPercentage >= 100 ? 'text-red-500' : 'text-red-400 animate-pulse'}`}>
              <AlertTriangle className="w-3 h-3" />
              {progressPercentage >= 100 ? 'Budget Exceeded!' : 'Nearing limit!'}
            </p>
          )}
        </div>
      </div>

      {/* Goal Setting Card */}
      <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/30 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Savings Goal
          </h3>
          {isEditingGoal ? (
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={editGoalValue} 
                onChange={e => setEditGoalValue(e.target.value)}
                className="bg-slate-950 border border-emerald-500 rounded px-2 py-1 text-xs text-white w-24 outline-none"
                autoFocus
              />
              <button onClick={saveGoal} className="text-emerald-400 hover:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditingGoal(true)} className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-indigo-300 transition-colors bg-slate-800/50 px-2.5 py-1 rounded-lg">
              {formatCurrency(savingGoal)} <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[10px] text-indigo-300/70 uppercase tracking-wider mb-0.5">Current Savings</p>
            <p className="text-xl font-black text-emerald-400">{formatCurrency(savedAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-medium">{goalProgress.toFixed(0)}% reached</p>
          </div>
        </div>

        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
            style={{ width: `${goalProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
