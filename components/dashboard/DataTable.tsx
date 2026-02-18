'use client';

import { SalesMetric } from '@/types';
import { SOURCE_COLORS } from '@/lib/utils';

interface DataTableProps {
  metrics: SalesMetric[];
  darkMode: boolean;
  onEdit: (metric: SalesMetric) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function DataTable({
  metrics,
  darkMode,
  onEdit,
  onDelete,
  onClearAll,
}: DataTableProps) {
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';
  const hoverBg = darkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-50';

  const handleDelete = (metric: SalesMetric) => {
    if (window.confirm(`Delete entry for ${metric.week_label}?`)) {
      onDelete(metric.id);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('WARNING: This will DELETE ALL DATA permanently. Are you absolutely sure?')) {
      if (window.confirm('This is your last chance. Delete everything?')) {
        onClearAll();
      }
    }
  };

  return (
    <div className={`${cardBg} rounded-3xl p-6 mb-8 border ${borderClass}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-xl font-semibold ${textClass}`}>Data Entries ({metrics.length})</h3>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition text-sm"
        >
          Clear All Data
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${borderClass}`}>
              {['Week', 'Source', 'Qualified', 'Booked', 'Closed', 'Cash', 'Actions'].map((h) => (
                <th key={h} className={`text-left py-3 px-4 font-medium ${textSecondary}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr
                key={metric.id}
                className={`border-b ${borderClass} ${hoverBg} transition duration-200`}
              >
                <td className={`py-3 px-4 ${textClass}`}>{metric.week_label}</td>
                <td className="py-3 px-4">
                  <span
                    className="px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: `${SOURCE_COLORS[metric.lead_source]}20`,
                      color: SOURCE_COLORS[metric.lead_source],
                    }}
                  >
                    {metric.lead_source}
                  </span>
                </td>
                <td className={`py-3 px-4 ${textClass}`}>{metric.qualified_conversations}</td>
                <td className={`py-3 px-4 ${textClass}`}>{metric.booked_calls}</td>
                <td className={`py-3 px-4 ${textClass}`}>{metric.closed_deals}</td>
                <td className={`py-3 px-4 ${textClass}`}>${metric.cash_collected.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(metric)}
                      className={`px-3 py-1 rounded-lg ${
                        darkMode ? 'bg-zinc-800 text-orange-500' : 'bg-orange-50 text-orange-600'
                      } hover:bg-orange-500 hover:text-white transition text-xs font-medium`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(metric)}
                      className={`px-3 py-1 rounded-lg ${
                        darkMode ? 'bg-zinc-800 text-red-500' : 'bg-red-50 text-red-600'
                      } hover:bg-red-500 hover:text-white transition text-xs font-medium`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
