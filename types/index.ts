export interface SalesMetric {
  id: string;
  user_id: string;
  month: string;
  week: string;
  year: string;
  week_label: string;
  qualified_conversations: number;
  booked_calls: number;
  closed_deals: number;
  booking_rate: number;
  conversion_rate: number;
  cash_collected: number;
  lead_source: 'Inbound' | 'Outbound' | 'Referral';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  razorpay_subscription_id: string | null;
  status: 'active' | 'inactive' | 'cancelled';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourceBreakdown {
  qualified: number;
  booked: number;
  closed: number;
  cash: number;
}

export interface LeadSourceBreakdownMap {
  Inbound: SourceBreakdown;
  Outbound: SourceBreakdown;
  Referral: SourceBreakdown;
}

export type ViewMode = 'all' | 'q1' | 'q2' | 'q3' | 'q4' | 'monthly' | 'weekly';
export type ChartViewMode = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type LeadSource = 'Inbound' | 'Outbound' | 'Referral';

export interface ChartDataPoint extends Partial<SalesMetric> {
  chartLabel: string;
  weekLabel: string;
  cashCollected: number;
  bookingRate: number;
  conversionRate: number;
  qualifiedConversations: number;
  bookedCalls: number;
  closedDeals: number;
  count?: number;
}

export interface AIInsightSections {
  summary: string;
  metrics: string;
  sources: string;
  trends: string;
  concerns: string;
  recommendations: string;
  quickWins: string;
  error?: string;
}
