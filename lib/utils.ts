import { ChartDataPoint, LeadSourceBreakdownMap, SalesMetric, ViewMode, ChartViewMode } from '@/types';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKS = ['1', '2', '3', '4', '5'];
export const YEARS = ['2024', '2025', '2026'];
export const LEAD_SOURCES = ['Inbound', 'Outbound', 'Referral'] as const;

export const QUARTERS: Record<string, string[]> = {
  Q1: ['January', 'February', 'March'],
  Q2: ['April', 'May', 'June'],
  Q3: ['July', 'August', 'September'],
  Q4: ['October', 'November', 'December'],
};

export const SOURCE_COLORS: Record<string, string> = {
  Inbound: '#FF6B35',
  Outbound: '#9B59B6',
  Referral: '#2ECC71',
};

export const GREETINGS = [
  "Let's crush those numbers today",
  'Ready to make it happen',
  'Time to scale new heights',
  'Your success story starts here',
  "Let's turn data into growth",
  'Building momentum, one deal at a time',
  'Excellence is the standard',
  "Let's optimize for greatness",
];

export function getRandomGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

export function calculateRates(
  qualified: number,
  booked: number,
  closed: number
): { bookingRate: number; conversionRate: number } {
  const bookingRate = qualified > 0 ? (booked / qualified) * 100 : 0;
  const conversionRate = booked > 0 ? (closed / booked) * 100 : 0;
  return {
    bookingRate: parseFloat(bookingRate.toFixed(2)),
    conversionRate: parseFloat(conversionRate.toFixed(2)),
  };
}

export function formatWeekLabel(month: string, week: string, year: string): string {
  return `${month} Week ${week}, ${year}`;
}

export function getFilteredMetrics(
  metrics: SalesMetric[],
  viewMode: ViewMode,
  selectedMonth: string
): SalesMetric[] {
  if (viewMode === 'all') return metrics;

  if (viewMode.startsWith('q')) {
    const quarter = viewMode.toUpperCase();
    const quarterMonths = QUARTERS[quarter] || [];
    return metrics.filter((m) => quarterMonths.includes(m.month));
  }

  if (viewMode === 'monthly' && selectedMonth) {
    return metrics.filter((m) => m.month === selectedMonth);
  }

  if (viewMode === 'weekly') {
    // Show last 8 weeks of data
    return metrics.slice(-8);
  }

  return metrics;
}

export function getLeadSourceBreakdown(
  filteredMetrics: SalesMetric[]
): LeadSourceBreakdownMap {
  const breakdown: LeadSourceBreakdownMap = {
    Inbound: { qualified: 0, booked: 0, closed: 0, cash: 0 },
    Outbound: { qualified: 0, booked: 0, closed: 0, cash: 0 },
    Referral: { qualified: 0, booked: 0, closed: 0, cash: 0 },
  };

  LEAD_SOURCES.forEach((source) => {
    const sourceMetrics = filteredMetrics.filter((m) => m.lead_source === source);
    breakdown[source] = {
      qualified: sourceMetrics.reduce((s, m) => s + m.qualified_conversations, 0),
      booked: sourceMetrics.reduce((s, m) => s + m.booked_calls, 0),
      closed: sourceMetrics.reduce((s, m) => s + m.closed_deals, 0),
      cash: sourceMetrics.reduce((s, m) => s + m.cash_collected, 0),
    };
  });

  return breakdown;
}

export function getAggregatedMetrics(
  filteredMetrics: SalesMetric[],
  chartViewMode: ChartViewMode
): ChartDataPoint[] {
  if (chartViewMode === 'yearly') {
    const grouped: Record<string, ChartDataPoint> = {};
    filteredMetrics.forEach((m) => {
      const key = m.year;
      if (!grouped[key]) {
        grouped[key] = {
          weekLabel: key,
          chartLabel: `'${key.substring(2)}`,
          qualifiedConversations: 0,
          bookedCalls: 0,
          closedDeals: 0,
          cashCollected: 0,
          bookingRate: 0,
          conversionRate: 0,
          count: 0,
        };
      }
      grouped[key].qualifiedConversations += m.qualified_conversations;
      grouped[key].bookedCalls += m.booked_calls;
      grouped[key].closedDeals += m.closed_deals;
      grouped[key].cashCollected += m.cash_collected;
      grouped[key].count = (grouped[key].count || 0) + 1;
    });
    return Object.values(grouped).map((g) => ({
      ...g,
      ...calculateRates(g.qualifiedConversations, g.bookedCalls, g.closedDeals),
    }));
  }

  if (chartViewMode === 'quarterly') {
    const grouped: Record<string, ChartDataPoint> = {};
    filteredMetrics.forEach((m) => {
      let quarter = 'Q1';
      if (QUARTERS.Q2.includes(m.month)) quarter = 'Q2';
      else if (QUARTERS.Q3.includes(m.month)) quarter = 'Q3';
      else if (QUARTERS.Q4.includes(m.month)) quarter = 'Q4';
      const key = `${quarter} ${m.year}`;
      if (!grouped[key]) {
        grouped[key] = {
          weekLabel: key,
          chartLabel: `${quarter} '${m.year.substring(2)}`,
          qualifiedConversations: 0,
          bookedCalls: 0,
          closedDeals: 0,
          cashCollected: 0,
          bookingRate: 0,
          conversionRate: 0,
          count: 0,
        };
      }
      grouped[key].qualifiedConversations += m.qualified_conversations;
      grouped[key].bookedCalls += m.booked_calls;
      grouped[key].closedDeals += m.closed_deals;
      grouped[key].cashCollected += m.cash_collected;
      grouped[key].count = (grouped[key].count || 0) + 1;
    });
    return Object.values(grouped).map((g) => ({
      ...g,
      ...calculateRates(g.qualifiedConversations, g.bookedCalls, g.closedDeals),
    }));
  }

  if (chartViewMode === 'monthly') {
    const grouped: Record<string, ChartDataPoint> = {};
    filteredMetrics.forEach((m) => {
      const key = `${m.month} ${m.year}`;
      if (!grouped[key]) {
        grouped[key] = {
          weekLabel: key,
          chartLabel: `${m.month.substring(0, 3)} '${m.year.substring(2)}`,
          qualifiedConversations: 0,
          bookedCalls: 0,
          closedDeals: 0,
          cashCollected: 0,
          bookingRate: 0,
          conversionRate: 0,
          count: 0,
        };
      }
      grouped[key].qualifiedConversations += m.qualified_conversations;
      grouped[key].bookedCalls += m.booked_calls;
      grouped[key].closedDeals += m.closed_deals;
      grouped[key].cashCollected += m.cash_collected;
      grouped[key].count = (grouped[key].count || 0) + 1;
    });
    return Object.values(grouped).map((g) => ({
      ...g,
      ...calculateRates(g.qualifiedConversations, g.bookedCalls, g.closedDeals),
    }));
  }

  // Weekly (default)
  return filteredMetrics.map((m) => ({
    weekLabel: m.week_label,
    chartLabel: `W${m.week}`,
    qualifiedConversations: m.qualified_conversations,
    bookedCalls: m.booked_calls,
    closedDeals: m.closed_deals,
    cashCollected: m.cash_collected,
    bookingRate: m.booking_rate,
    conversionRate: m.conversion_rate,
  }));
}

export function calculateTotals(filteredMetrics: SalesMetric[]) {
  const len = filteredMetrics.length;
  return {
    totalCash: filteredMetrics.reduce((s, m) => s + m.cash_collected, 0),
    avgBookingRate: len > 0 ? filteredMetrics.reduce((s, m) => s + m.booking_rate, 0) / len : 0,
    avgConversionRate: len > 0 ? filteredMetrics.reduce((s, m) => s + m.conversion_rate, 0) / len : 0,
    totalQualified: filteredMetrics.reduce((s, m) => s + m.qualified_conversations, 0),
    totalBooked: filteredMetrics.reduce((s, m) => s + m.booked_calls, 0),
    totalClosed: filteredMetrics.reduce((s, m) => s + m.closed_deals, 0),
  };
}
