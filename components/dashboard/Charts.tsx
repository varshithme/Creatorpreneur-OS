'use client';

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint, ChartViewMode } from '@/types';

interface ChartsProps {
  chartData: ChartDataPoint[];
  chartViewMode: ChartViewMode;
  totalCash: number;
  darkMode: boolean;
  onChartViewChange: (mode: ChartViewMode) => void;
}

const CHART_MODES: ChartViewMode[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

const tooltipStyle = (darkMode: boolean) => ({
  backgroundColor: darkMode ? '#09090b' : '#fff',
  border: 'none' as const,
  borderRadius: '16px',
  padding: '12px 16px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
});

const smallTooltipStyle = (darkMode: boolean) => ({
  ...tooltipStyle(darkMode),
  borderRadius: '12px',
  padding: '8px 12px',
  fontSize: '12px',
});

const gridColor = (darkMode: boolean) => (darkMode ? '#27272a' : '#f1f5f9');
const axisColor = (darkMode: boolean) => (darkMode ? '#52525b' : '#94a3b8');

export default function Charts({
  chartData,
  chartViewMode,
  totalCash,
  darkMode,
  onChartViewChange,
}: ChartsProps) {
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';
  const inactiveBg = darkMode ? 'bg-zinc-900 text-slate-400' : 'bg-slate-100 text-slate-600';
  const hoverBg = darkMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-200';

  const labelFormatter = (_: unknown, payload: Array<{ payload: ChartDataPoint }>) => {
    if (payload && payload[0]) {
      return payload[0].payload.weekLabel || '';
    }
    return '';
  };

  return (
    <div className="mb-8">
      {/* Section header + toggle */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-2xl font-semibold ${textClass}`}>Analytics</h3>
        <div className="flex gap-2">
          {CHART_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => onChartViewChange(mode)}
              className={`px-5 py-2.5 rounded-full font-medium transition duration-300 text-sm ${
                chartViewMode === mode
                  ? 'bg-orange-500 text-white shadow-lg'
                  : `${inactiveBg} ${hoverBg}`
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Large featured chart — Revenue */}
      <div className={`${cardBg} rounded-3xl p-8 mb-6 border ${borderClass}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className={`text-lg font-semibold ${textClass}`}>Revenue Performance</h4>
            <p className={`text-sm ${textSecondary} font-light mt-1`}>Track your cash collection over time</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold text-orange-500">${totalCash.toLocaleString()}</div>
            <div className={`text-sm ${textSecondary} font-light`}>Total Revenue</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor(darkMode)} vertical={false} />
            <XAxis
              dataKey="chartLabel"
              stroke={axisColor(darkMode)}
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '13px', fontWeight: '500' }}
            />
            <YAxis
              stroke={axisColor(darkMode)}
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '13px', fontWeight: '500' }}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={tooltipStyle(darkMode)}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              labelStyle={{ color: darkMode ? '#fff' : '#000', fontWeight: '600', marginBottom: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="cashCollected"
              stroke="#FF6B35"
              strokeWidth={3}
              dot={{ fill: '#FF6B35', r: 5, strokeWidth: 2, stroke: darkMode ? '#000' : '#fff' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3 small overview charts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Conversion Rates */}
        <div className={`${cardBg} rounded-2xl p-6 border ${borderClass}`}>
          <h4 className={`text-sm font-semibold ${textClass} mb-4`}>Conversion Rates</h4>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor(darkMode)} vertical={false} />
              <XAxis
                dataKey="chartLabel"
                stroke={axisColor(darkMode)}
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '11px' }}
              />
              <YAxis
                stroke={axisColor(darkMode)}
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '11px' }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={smallTooltipStyle(darkMode)}
                formatter={(v: number) => `${v.toFixed(1)}%`}
                labelFormatter={labelFormatter}
              />
              <Line type="monotone" dataKey="bookingRate" stroke="#FF6B35" strokeWidth={2} name="Booking" dot={false} />
              <Line type="monotone" dataKey="conversionRate" stroke="#9B59B6" strokeWidth={2} name="Conversion" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Activity */}
        <div className={`${cardBg} rounded-2xl p-6 border ${borderClass}`}>
          <h4 className={`text-sm font-semibold ${textClass} mb-4`}>Pipeline Activity</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor(darkMode)} vertical={false} />
              <XAxis
                dataKey="chartLabel"
                stroke={axisColor(darkMode)}
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '11px' }}
              />
              <YAxis
                stroke={axisColor(darkMode)}
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '11px' }}
              />
              <Tooltip
                contentStyle={smallTooltipStyle(darkMode)}
                labelFormatter={labelFormatter}
              />
              <Bar dataKey="qualifiedConversations" fill="#FF6B35" name="Qualified" radius={[6, 6, 0, 0]} />
              <Bar dataKey="bookedCalls" fill="#9B59B6" name="Booked" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Closed Deals */}
        <div className={`${cardBg} rounded-2xl p-6 border ${borderClass}`}>
          <h4 className={`text-sm font-semibold ${textClass} mb-4`}>Closed Deals</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor(darkMode)} vertical={false} />
              <XAxis
                dataKey="chartLabel"
                stroke={axisColor(darkMode)}
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '11px' }}
              />
              <YAxis
                stroke={axisColor(darkMode)}
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '11px' }}
              />
              <Tooltip
                contentStyle={smallTooltipStyle(darkMode)}
                labelFormatter={labelFormatter}
              />
              <Bar dataKey="closedDeals" fill="#2ECC71" name="Closed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
