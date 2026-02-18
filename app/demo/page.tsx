'use client';

import { useState, useMemo } from 'react';
import { SalesMetric, ViewMode, ChartViewMode } from '@/types';
import {
  getFilteredMetrics, getLeadSourceBreakdown,
  getAggregatedMetrics, calculateTotals, getRandomGreeting,
} from '@/lib/utils';

import KPICards from '@/components/dashboard/KPICards';
import FilterBar from '@/components/dashboard/FilterBar';
import LeadSourceBreakdown from '@/components/dashboard/LeadSourceBreakdown';
import Charts from '@/components/dashboard/Charts';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Target } from 'lucide-react';

// ── Sample data ──────────────────────────────────────────────────────
const SAMPLE_METRICS: SalesMetric[] = [
  { id: '1', user_id: 'demo', month: 'October', week: '1', year: '2025', week_label: 'October Week 1, 2025', qualified_conversations: 40, booked_calls: 22, closed_deals: 8, booking_rate: 55, conversion_rate: 36.4, cash_collected: 24000, lead_source: 'Inbound', created_at: '', updated_at: '' },
  { id: '2', user_id: 'demo', month: 'October', week: '2', year: '2025', week_label: 'October Week 2, 2025', qualified_conversations: 35, booked_calls: 18, closed_deals: 6, booking_rate: 51.4, conversion_rate: 33.3, cash_collected: 18000, lead_source: 'Outbound', created_at: '', updated_at: '' },
  { id: '3', user_id: 'demo', month: 'October', week: '3', year: '2025', week_label: 'October Week 3, 2025', qualified_conversations: 28, booked_calls: 20, closed_deals: 10, booking_rate: 71.4, conversion_rate: 50, cash_collected: 30000, lead_source: 'Referral', created_at: '', updated_at: '' },
  { id: '4', user_id: 'demo', month: 'October', week: '4', year: '2025', week_label: 'October Week 4, 2025', qualified_conversations: 45, booked_calls: 25, closed_deals: 9, booking_rate: 55.6, conversion_rate: 36, cash_collected: 27000, lead_source: 'Inbound', created_at: '', updated_at: '' },
  { id: '5', user_id: 'demo', month: 'November', week: '1', year: '2025', week_label: 'November Week 1, 2025', qualified_conversations: 50, booked_calls: 30, closed_deals: 12, booking_rate: 60, conversion_rate: 40, cash_collected: 36000, lead_source: 'Outbound', created_at: '', updated_at: '' },
  { id: '6', user_id: 'demo', month: 'November', week: '2', year: '2025', week_label: 'November Week 2, 2025', qualified_conversations: 38, booked_calls: 28, closed_deals: 14, booking_rate: 73.7, conversion_rate: 50, cash_collected: 42000, lead_source: 'Referral', created_at: '', updated_at: '' },
  { id: '7', user_id: 'demo', month: 'November', week: '3', year: '2025', week_label: 'November Week 3, 2025', qualified_conversations: 55, booked_calls: 32, closed_deals: 11, booking_rate: 58.2, conversion_rate: 34.4, cash_collected: 33000, lead_source: 'Inbound', created_at: '', updated_at: '' },
  { id: '8', user_id: 'demo', month: 'November', week: '4', year: '2025', week_label: 'November Week 4, 2025', qualified_conversations: 60, booked_calls: 38, closed_deals: 16, booking_rate: 63.3, conversion_rate: 42.1, cash_collected: 48000, lead_source: 'Outbound', created_at: '', updated_at: '' },
  { id: '9', user_id: 'demo', month: 'December', week: '1', year: '2025', week_label: 'December Week 1, 2025', qualified_conversations: 42, booked_calls: 26, closed_deals: 13, booking_rate: 61.9, conversion_rate: 50, cash_collected: 39000, lead_source: 'Referral', created_at: '', updated_at: '' },
  { id: '10', user_id: 'demo', month: 'December', week: '2', year: '2025', week_label: 'December Week 2, 2025', qualified_conversations: 65, booked_calls: 40, closed_deals: 18, booking_rate: 61.5, conversion_rate: 45, cash_collected: 54000, lead_source: 'Inbound', created_at: '', updated_at: '' },
  { id: '11', user_id: 'demo', month: 'December', week: '3', year: '2025', week_label: 'December Week 3, 2025', qualified_conversations: 70, booked_calls: 45, closed_deals: 20, booking_rate: 64.3, conversion_rate: 44.4, cash_collected: 60000, lead_source: 'Outbound', created_at: '', updated_at: '' },
  { id: '12', user_id: 'demo', month: 'December', week: '4', year: '2025', week_label: 'December Week 4, 2025', qualified_conversations: 80, booked_calls: 52, closed_deals: 24, booking_rate: 65, conversion_rate: 46.2, cash_collected: 72000, lead_source: 'Referral', created_at: '', updated_at: '' },
];

export default function DemoPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('weekly');

  const greeting = useMemo(() => getRandomGreeting(), []);

  const filtered = useMemo(
    () => getFilteredMetrics(SAMPLE_METRICS, viewMode, selectedMonth),
    [viewMode, selectedMonth]
  );
  const totals = useMemo(() => calculateTotals(filtered), [filtered]);
  const breakdown = useMemo(() => getLeadSourceBreakdown(filtered), [filtered]);
  const chartData = useMemo(() => getAggregatedMetrics(filtered, chartViewMode), [filtered, chartViewMode]);

  const bgClass = darkMode ? 'bg-black' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const badgeBg = darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-orange-50 text-orange-600';

  return (
    <div
      className={`min-h-screen ${bgClass} transition-colors duration-300`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto p-8">
        {/* Demo banner */}
        <div className={`mb-6 flex items-center gap-3 px-5 py-3 rounded-2xl ${badgeBg} w-fit`}>
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium">Preview Mode — sample data only</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className={`text-5xl font-semibold ${textClass} mb-2 tracking-tight`}>
              Hello, Varshith
            </h1>
            <p className="text-2xl font-light text-orange-500">{greeting}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode(!darkMode)} />
            <a
              href="/login"
              className="px-6 py-3 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 transition duration-300 shadow-lg"
            >
              Sign In →
            </a>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          viewMode={viewMode}
          selectedMonth={selectedMonth}
          darkMode={darkMode}
          onViewModeChange={setViewMode}
          onMonthChange={setSelectedMonth}
        />

        {/* KPI Cards */}
        <KPICards
          totalCash={totals.totalCash}
          avgBookingRate={totals.avgBookingRate}
          avgConversionRate={totals.avgConversionRate}
          totalClosed={totals.totalClosed}
          darkMode={darkMode}
        />

        {/* Lead Source Breakdown */}
        <LeadSourceBreakdown breakdown={breakdown} darkMode={darkMode} />

        {/* Charts */}
        <Charts
          chartData={chartData}
          chartViewMode={chartViewMode}
          totalCash={totals.totalCash}
          darkMode={darkMode}
          onChartViewChange={setChartViewMode}
        />

        {/* AI Insights placeholder */}
        <div className={`${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} rounded-3xl p-8 border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className={`text-2xl font-semibold ${textClass}`}>AI Insights</h2>
                <p className={`text-sm ${textSecondary} font-light`}>Powered by Claude — available after sign in</p>
              </div>
            </div>
            <a
              href="/login"
              className="bg-orange-500 text-white px-6 py-3 rounded-full font-medium hover:bg-orange-600 transition duration-300 shadow-lg"
            >
              Get Started
            </a>
          </div>
          <div className={`mt-8 text-center py-8 ${textSecondary} font-light`}>
            Sign up to unlock AI-powered analysis of your sales data
          </div>
        </div>
      </div>
    </div>
  );
}
