'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SalesMetric, ViewMode, ChartViewMode } from '@/types';
import {
  getFilteredMetrics,
  getLeadSourceBreakdown,
  getAggregatedMetrics,
  calculateTotals,
  getRandomGreeting,
  MONTHS,
} from '@/lib/utils';

import Header from '@/components/dashboard/Header';
import FilterBar from '@/components/dashboard/FilterBar';
import KPICards from '@/components/dashboard/KPICards';
import DataForm from '@/components/dashboard/DataForm';
import DataTable from '@/components/dashboard/DataTable';
import LeadSourceBreakdown from '@/components/dashboard/LeadSourceBreakdown';
import Charts from '@/components/dashboard/Charts';
import AIInsights from '@/components/dashboard/AIInsights';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [metrics, setMetrics] = useState<SalesMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [greeting] = useState(getRandomGreeting());

  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('weekly');

  const [showForm, setShowForm] = useState(false);
  const [showDataTable, setShowDataTable] = useState(false);
  const [editingMetric, setEditingMetric] = useState<SalesMetric | null>(null);

  // Theme classes
  const bgClass = darkMode ? 'bg-black' : 'bg-white';

  // ── Auth + data load ────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/login'); return; }

      // Check subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single();
      if (!sub || sub.status !== 'active') { router.push('/subscribe'); return; }

      setUserId(user.id);

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      if (profile?.name) setUserName(profile.name);

      // Load saved theme
      const savedTheme = localStorage.getItem('dark-mode');
      if (savedTheme === 'true') setDarkMode(true);

      // Load metrics
      const { data: metricsData } = await supabase
        .from('sales_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: true })
        .order('month', { ascending: true })
        .order('week', { ascending: true });

      if (metricsData) {
        // Sort by month index too
        const sorted = [...metricsData].sort((a, b) => {
          if (a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
          const mi = MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
          if (mi !== 0) return mi;
          return parseInt(a.week) - parseInt(b.week);
        });
        setMetrics(sorted);
      }
      setLoading(false);
    };
    init();
  }, []);

  // ── Computed values ─────────────────────────────────────────────────
  const filteredMetrics = useMemo(
    () => getFilteredMetrics(metrics, viewMode, selectedMonth),
    [metrics, viewMode, selectedMonth]
  );
  const totals = useMemo(() => calculateTotals(filteredMetrics), [filteredMetrics]);
  const breakdown = useMemo(() => getLeadSourceBreakdown(filteredMetrics), [filteredMetrics]);
  const chartData = useMemo(
    () => getAggregatedMetrics(filteredMetrics, chartViewMode),
    [filteredMetrics, chartViewMode]
  );

  // ── Handlers ────────────────────────────────────────────────────────
  const handleToggleTheme = useCallback(() => {
    setDarkMode((prev) => {
      localStorage.setItem('dark-mode', (!prev).toString());
      return !prev;
    });
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/login');
  }, []);

  const handleNameSave = useCallback(async (name: string) => {
    setUserName(name);
    await supabase.from('profiles').update({ name }).eq('id', userId);
  }, [userId]);

  const handleSaveMetric = useCallback(async (
    data: Omit<SalesMetric, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingMetric) {
      const { error } = await supabase
        .from('sales_metrics')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', editingMetric.id);
      if (!error) {
        setMetrics((prev) =>
          prev.map((m) => (m.id === editingMetric.id ? { ...m, ...data } : m))
        );
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('sales_metrics')
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (!error && inserted) {
        setMetrics((prev) =>
          [...prev, inserted].sort((a, b) => {
            if (a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
            const mi = MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
            if (mi !== 0) return mi;
            return parseInt(a.week) - parseInt(b.week);
          })
        );
      }
    }
    setShowForm(false);
    setEditingMetric(null);
  }, [editingMetric, userId]);

  const handleEdit = useCallback((metric: SalesMetric) => {
    setEditingMetric(metric);
    setShowForm(true);
    setShowDataTable(false);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from('sales_metrics').delete().eq('id', id);
    setMetrics((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleClearAll = useCallback(async () => {
    await supabase.from('sales_metrics').delete().eq('user_id', userId);
    setMetrics([]);
    setShowDataTable(false);
  }, [userId]);

  const handleAddData = useCallback(() => {
    if (showForm) {
      setShowForm(false);
      setEditingMetric(null);
    } else {
      setShowForm(true);
      setEditingMetric(null);
    }
  }, [showForm]);

  // ── Render ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className={`${darkMode ? 'text-white' : 'text-slate-900'} text-xl font-light tracking-wide`}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${bgClass} transition-colors duration-300`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <Header
          userName={userName}
          greeting={greeting}
          darkMode={darkMode}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
          onManageData={() => setShowDataTable((v) => !v)}
          onAddData={handleAddData}
          showDataTable={showDataTable}
          showForm={showForm}
          onNameSave={handleNameSave}
        />

        {/* Filter bar */}
        <FilterBar
          viewMode={viewMode}
          selectedMonth={selectedMonth}
          darkMode={darkMode}
          onViewModeChange={setViewMode}
          onMonthChange={setSelectedMonth}
        />

        {/* Data table */}
        {showDataTable && metrics.length > 0 && (
          <DataTable
            metrics={metrics}
            darkMode={darkMode}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
          />
        )}

        {/* Data entry form */}
        {showForm && (
          <DataForm
            darkMode={darkMode}
            editingMetric={editingMetric}
            onSave={handleSaveMetric}
            onCancel={() => { setShowForm(false); setEditingMetric(null); }}
          />
        )}

        {/* Empty state */}
        {metrics.length === 0 ? (
          <EmptyState darkMode={darkMode} onAdd={() => setShowForm(true)} />
        ) : (
          <>
            <KPICards
              totalCash={totals.totalCash}
              avgBookingRate={totals.avgBookingRate}
              avgConversionRate={totals.avgConversionRate}
              totalClosed={totals.totalClosed}
              darkMode={darkMode}
            />

            <LeadSourceBreakdown breakdown={breakdown} darkMode={darkMode} />

            <Charts
              chartData={chartData}
              chartViewMode={chartViewMode}
              totalCash={totals.totalCash}
              darkMode={darkMode}
              onChartViewChange={setChartViewMode}
            />

            <AIInsights
              metrics={filteredMetrics}
              breakdown={breakdown}
              viewMode={viewMode}
              darkMode={darkMode}
            />
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ darkMode, onAdd }: { darkMode: boolean; onAdd: () => void }) {
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';

  return (
    <div className={`${cardBg} rounded-3xl p-16 text-center border ${borderClass}`}>
      <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Users className="w-10 h-10 text-orange-500" />
      </div>
      <h3 className={`text-2xl font-semibold ${textClass} mb-2`}>No data yet</h3>
      <p className={`${textSecondary} mb-6 font-light`}>Start tracking to unlock powerful insights</p>
      <button
        onClick={onAdd}
        className="bg-orange-500 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition duration-300"
      >
        Add Your First Entry
      </button>
    </div>
  );
}
