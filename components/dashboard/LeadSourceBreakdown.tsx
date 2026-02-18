'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { LeadSourceBreakdownMap } from '@/types';
import { SOURCE_COLORS, LEAD_SOURCES } from '@/lib/utils';

interface LeadSourceBreakdownProps {
  breakdown: LeadSourceBreakdownMap;
  darkMode: boolean;
}

export default function LeadSourceBreakdown({ breakdown, darkMode }: LeadSourceBreakdownProps) {
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';

  const pieData = LEAD_SOURCES.map((source) => ({
    name: source,
    value: breakdown[source].closed,
    color: SOURCE_COLORS[source],
  }));

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      {/* Donut chart */}
      <div className={`${cardBg} rounded-3xl p-8 border ${borderClass}`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-6`}>Lead Source Breakdown</h3>
        <div className="flex items-center justify-between gap-8">
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={false}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#18181b' : '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-4 min-w-[140px]">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <div>
                  <div className={`text-sm font-medium ${textClass} leading-tight`}>{entry.name}</div>
                  <div className={`text-xs ${textSecondary} mt-0.5`}>{entry.value} closed</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Source performance funnel */}
      <div className={`${cardBg} rounded-3xl p-8 border ${borderClass}`}>
        <h3 className={`text-xl font-semibold ${textClass} mb-6`}>Source Performance</h3>
        <div className="space-y-6">
          {LEAD_SOURCES.map((source) => {
            const data = breakdown[source];
            const conversion =
              data.qualified > 0
                ? ((data.closed / data.qualified) * 100).toFixed(1)
                : '0.0';
            return (
              <div
                key={source}
                className="border-l-4 pl-4"
                style={{ borderColor: SOURCE_COLORS[source] }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-semibold ${textClass}`}>{source}</span>
                  <span className={`text-sm ${textSecondary}`}>${data.cash.toLocaleString()}</span>
                </div>
                <div className={`text-xs ${textSecondary} font-light`}>
                  {data.qualified} → {data.booked} → {data.closed}
                </div>
                <div
                  className="text-sm font-semibold mt-1"
                  style={{ color: SOURCE_COLORS[source] }}
                >
                  {conversion}% conversion
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
