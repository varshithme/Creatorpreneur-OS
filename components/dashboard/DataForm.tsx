'use client';

import { useState, useEffect } from 'react';
import { SalesMetric } from '@/types';
import { MONTHS, WEEKS, YEARS, LEAD_SOURCES, calculateRates, formatWeekLabel } from '@/lib/utils';

interface FormData {
  month: string;
  week: string;
  year: string;
  leadSource: string;
  qualifiedConversations: string;
  bookedCalls: string;
  closedDeals: string;
  cashCollected: string;
}

interface DataFormProps {
  darkMode: boolean;
  editingMetric: SalesMetric | null;
  onSave: (data: Omit<SalesMetric, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const defaultForm = (): FormData => ({
  month: new Date().toLocaleString('default', { month: 'long' }),
  week: '1',
  year: new Date().getFullYear().toString(),
  leadSource: 'Inbound',
  qualifiedConversations: '',
  bookedCalls: '',
  closedDeals: '',
  cashCollected: '',
});

export default function DataForm({ darkMode, editingMetric, onSave, onCancel }: DataFormProps) {
  const [form, setForm] = useState<FormData>(defaultForm());
  const [error, setError] = useState('');

  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const cardBg = darkMode ? 'bg-zinc-900' : 'bg-white';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';
  const inputClass = darkMode
    ? 'bg-zinc-800 text-white border-zinc-700'
    : 'bg-slate-50 text-slate-900 border-slate-200';

  useEffect(() => {
    if (editingMetric) {
      setForm({
        month: editingMetric.month,
        week: editingMetric.week,
        year: editingMetric.year,
        leadSource: editingMetric.lead_source,
        qualifiedConversations: editingMetric.qualified_conversations.toString(),
        bookedCalls: editingMetric.booked_calls.toString(),
        closedDeals: editingMetric.closed_deals.toString(),
        cashCollected: editingMetric.cash_collected.toString(),
      });
    } else {
      setForm(defaultForm());
    }
  }, [editingMetric]);

  const qualified = parseInt(form.qualifiedConversations) || 0;
  const booked = parseInt(form.bookedCalls) || 0;
  const closed = parseInt(form.closedDeals) || 0;
  const showRates = form.qualifiedConversations && form.bookedCalls && form.closedDeals;
  const rates = showRates ? calculateRates(qualified, booked, closed) : null;

  const handleSubmit = () => {
    setError('');
    const {
      month, week, year, leadSource,
      qualifiedConversations, bookedCalls, closedDeals, cashCollected,
    } = form;

    if (!month || !week || !year || !qualifiedConversations || !bookedCalls || !closedDeals || !cashCollected || !leadSource) {
      setError('Please fill in all fields');
      return;
    }

    const q = parseInt(qualifiedConversations);
    const b = parseInt(bookedCalls);
    const c = parseInt(closedDeals);

    if (q < 0 || b < 0 || c < 0 || parseFloat(cashCollected) < 0) {
      setError('All numbers must be positive');
      return;
    }
    if (q < b || b < c) {
      setError('Qualified ≥ Booked ≥ Closed (funnel logic)');
      return;
    }

    const { bookingRate, conversionRate } = calculateRates(q, b, c);

    onSave({
      month,
      week,
      year,
      week_label: formatWeekLabel(month, week, year),
      qualified_conversations: q,
      booked_calls: b,
      closed_deals: c,
      booking_rate: bookingRate,
      conversion_rate: conversionRate,
      cash_collected: parseFloat(cashCollected),
      lead_source: leadSource as SalesMetric['lead_source'],
    });
  };

  const field = (label: string, key: keyof FormData, type = 'text', opts?: Record<string, string>) => (
    <div>
      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>{label}</label>
      {opts ? (
        <select
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl ${inputClass} border focus:outline-none focus:ring-2 focus:ring-orange-500`}
        >
          {Object.entries(opts).map(([val, lab]) => (
            <option key={val} value={val}>{lab}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl ${inputClass} border focus:outline-none focus:ring-2 focus:ring-orange-500`}
          placeholder={type === 'number' ? '0' : ''}
          min={type === 'number' ? '0' : undefined}
        />
      )}
    </div>
  );

  const monthOpts = Object.fromEntries(MONTHS.map((m) => [m, m]));
  const weekOpts = Object.fromEntries(WEEKS.map((w) => [w, `Week ${w}`]));
  const yearOpts = Object.fromEntries(YEARS.map((y) => [y, y]));
  const sourceOpts = Object.fromEntries(LEAD_SOURCES.map((s) => [s, s]));

  return (
    <div className={`${cardBg} rounded-3xl p-8 mb-8 border ${borderClass}`}>
      <h2 className={`text-2xl font-semibold ${textClass} mb-6`}>
        {editingMetric ? 'Edit' : 'Add'} Weekly Metrics
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {field('Month', 'month', 'text', monthOpts)}
        {field('Week', 'week', 'text', weekOpts)}
        {field('Year', 'year', 'text', yearOpts)}
        {field('Lead Source', 'leadSource', 'text', sourceOpts)}
        {field('Qualified Conversations', 'qualifiedConversations', 'number')}
        {field('Booked Calls', 'bookedCalls', 'number')}
        {field('Closed Deals', 'closedDeals', 'number')}
        {field('Cash Collected ($)', 'cashCollected', 'number')}

        {/* Auto-calculated rates preview */}
        {rates && (
          <div className="col-span-2 bg-orange-500/10 rounded-2xl p-6 border border-orange-500/20">
            <h3 className={`text-sm font-medium ${textClass} mb-4`}>Auto-Calculated Rates</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-semibold text-orange-500">{rates.bookingRate.toFixed(1)}%</div>
                <div className={`text-sm ${textSecondary} mt-1`}>Booking Rate</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-orange-500">{rates.conversionRate.toFixed(1)}%</div>
                <div className={`text-sm ${textSecondary} mt-1`}>Conversion Rate</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="col-span-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="col-span-2 flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 px-6 py-3 rounded-xl ${darkMode ? 'bg-zinc-800 text-white' : 'bg-slate-100 text-slate-900'} font-medium hover:bg-opacity-80 transition`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition"
          >
            {editingMetric ? 'Update' : 'Save'} Metrics
          </button>
        </div>
      </div>
    </div>
  );
}
