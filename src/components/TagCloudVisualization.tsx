import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, TrendingUp, Sparkles, Filter, Percent, Landmark } from 'lucide-react';
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

interface TagCloudVisualizationProps {
  transactions: Transaction[];
  selectedTagFilter: string;
  onSelectTag: (tag: string) => void;
  title?: string;
}

export function TagCloudVisualization({
  transactions,
  selectedTagFilter,
  onSelectTag,
  title = "Frequently Used Categories"
}: TagCloudVisualizationProps) {
  // Compute tag frequencies and total volume
  const tagStats = useMemo(() => {
    const stats: Record<string, { count: number; totalAmount: number; name: string }> = {};
    let totalTaggedCount = 0;

    transactions.forEach(tx => {
      if (tx.tags && Array.isArray(tx.tags)) {
        tx.tags.forEach(tag => {
          const trimmed = tag.trim();
          if (trimmed) {
            if (!stats[trimmed]) {
              stats[trimmed] = { count: 0, totalAmount: 0, name: trimmed };
            }
            stats[trimmed].count += 1;
            stats[trimmed].totalAmount += tx.amount;
            totalTaggedCount += 1;
          }
        });
      }
    });

    const statsArray = Object.values(stats);
    
    // Sort by count descending, then total amount descending
    return {
      list: statsArray.sort((a, b) => b.count - a.count || b.totalAmount - a.totalAmount),
      totalTaggedCount
    };
  }, [transactions]);

  // Find max and min counts to perform relative scaling
  const { maxCount, minCount } = useMemo(() => {
    if (tagStats.list.length === 0) return { maxCount: 1, minCount: 1 };
    const counts = tagStats.list.map(s => s.count);
    return {
      maxCount: Math.max(...counts),
      minCount: Math.min(...counts)
    };
  }, [tagStats]);

  // Handle clicking a tag
  const handleTagClick = (tag: string) => {
    if (selectedTagFilter === tag) {
      onSelectTag('ALL'); // Toggle off
    } else {
      onSelectTag(tag);
    }
  };

  if (tagStats.list.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl text-center shadow-xs">
        <Tag className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
          No Tag Analytics Available
        </h4>
        <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
          Add tags (e.g. Work, Home, Food, Travel) to your transactions to automatically generate category insights.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs text-left">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {title}
          </h4>
        </div>
        <span className="text-[8px] font-bold bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-505">
          {tagStats.list.length} {tagStats.list.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      {/* The Interactive Tag Cloud */}
      <div className="flex flex-wrap gap-2 items-center justify-start p-1.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100/40 dark:border-slate-850/40 min-h-[70px]">
        {tagStats.list.map((stat, idx) => {
          // Perform logarithmic or linear scale for font sizes/weights
          // To make a prominent, beautiful visual differentiation
          const ratio = maxCount === minCount ? 1 : (stat.count - minCount) / (maxCount - minCount);
          
          // Determine font size classes
          let fontSizeClass = "text-[9.5px]";
          let paddingClass = "px-2.5 py-1";
          if (ratio > 0.8) {
            fontSizeClass = "text-[13px]";
            paddingClass = "px-4 py-2";
          } else if (ratio > 0.5) {
            fontSizeClass = "text-[11.5px]";
            paddingClass = "px-3.5 py-1.5";
          } else if (ratio > 0.2) {
            fontSizeClass = "text-[10.5px]";
            paddingClass = "px-3 py-1";
          }

          // Dynamic colors based on active status vs normal weight
          const isSelected = selectedTagFilter === stat.name;
          
          return (
            <motion.button
              key={stat.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTagClick(stat.name)}
              className={cn(
                "rounded-2xl transition-all font-black flex items-center gap-1 border shadow-2xs cursor-pointer select-none",
                fontSizeClass,
                paddingClass,
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : ratio > 0.6
                    ? "bg-indigo-50/85 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-150/80 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60"
                    : ratio > 0.2
                      ? "bg-slate-50/90 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      : "bg-slate-50/50 dark:bg-slate-900/40 text-slate-450 dark:text-slate-400 border-slate-100 dark:border-slate-850/65 hover:border-slate-200 dark:hover:border-slate-800"
              )}
            >
              <span>#</span>
              <span>{stat.name}</span>
              <span className={cn(
                "ml-1 text-[8px] font-black px-1 py-0.2 rounded-full",
                isSelected 
                  ? "bg-indigo-500 text-white" 
                  : "bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              )}>
                {stat.count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Tag Insights Panel */}
      <AnimatePresence mode="wait">
        {selectedTagFilter !== 'ALL' && tagStats.list.find(s => s.name === selectedTagFilter) && (() => {
          const selectedStat = tagStats.list.find(s => s.name === selectedTagFilter)!;
          const percentage = ((selectedStat.count / (transactions.length || 1)) * 100).toFixed(0);
          return (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-850/50 overflow-hidden text-left"
            >
              <div className="bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl p-3 border border-indigo-100/30 dark:border-indigo-900/20 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Filter className="w-3 h-3" />
                    <p className="text-[10px] font-black uppercase tracking-wider">Filtered Category Insight</p>
                  </div>
                  <h5 className="text-[12px] font-black text-slate-800 dark:text-slate-100">
                    #{selectedStat.name} Category
                  </h5>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                    Represents <span className="font-black text-indigo-600 dark:text-indigo-400">{percentage}%</span> of your listed ledger entries.
                  </p>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Total Volume
                  </div>
                  <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    ₹{selectedStat.totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">
                    avg: ₹{Math.round(selectedStat.totalAmount / selectedStat.count).toLocaleString('en-IN')}/tx
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
