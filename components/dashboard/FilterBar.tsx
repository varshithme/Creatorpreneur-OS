'use client';

import { MONTHS } from '@/lib/utils';
import { ViewMode } from '@/types';

interface FilterBarProps {
  viewMode: ViewMode;
  selectedMonth: string;
  darkMode: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onMonthChange: (month: string) => void;
}

const FILTERS: { label: string; value: ViewMode }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Q1', value: 'q1' },
  { label: 'Q2', value: 'q2' },
  { label: 'Q3', value: 'q3' },
  { label: 'Q4', value: 'q4' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
];

export default function FilterBar({
  viewMode,
  selectedMonth,
  darkMode,
  onViewModeChange,
  onMonthChange,
}: FilterBarProps) {
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';
  const inputClass = darkMode
    ? 'bg-zinc-800 text-white border-zinc-700'
    : 'bg-slate-50 text-slate-900 border-slate-200';
  const inactiveBg = darkMode ? 'bg-zinc-800 text-slate-400' : 'bg-slate-100 text-slate-600';
  const hoverBg = darkMode ? 'hover:bg-zinc-700' : 'hover:bg-slate-200';

  return (
    <div className={`${cardBg} rounded-3xl p-6 mb-8 border ${borderClass}`}>
      <div className="grid grid-cols-7 gap-3">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onViewModeChange(value)}
            className={`px-4 py-3 rounded-xl font-medium transition duration-300 ${
              viewMode === value
                ? 'bg-orange-500 text-white'
                : `${inactiveBg} ${hoverBg}`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {viewMode === 'monthly' && (
        <div className="mt-4">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl ${inputClass} border focus:outline-none focus:ring-2 focus:ring-orange-500`}
          >
            <option value="">All Months</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
