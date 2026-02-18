'use client';

import { DollarSign, Phone, CheckCircle, Target } from 'lucide-react';

interface KPICardsProps {
  totalCash: number;
  avgBookingRate: number;
  avgConversionRate: number;
  totalClosed: number;
  darkMode: boolean;
}

export default function KPICards({
  totalCash,
  avgBookingRate,
  avgConversionRate,
  totalClosed,
  darkMode,
}: KPICardsProps) {
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const borderClass = darkMode ? 'border-zinc-800' : 'border-slate-200';
  const cardAlt = darkMode ? 'bg-zinc-900' : 'bg-slate-50';

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {/* Total Revenue — featured orange card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
        <DollarSign className="w-8 h-8 mb-3 opacity-80" />
        <div className="text-4xl font-semibold tracking-tight mb-1">
          ${totalCash.toLocaleString()}
        </div>
        <div className="text-orange-100 text-sm font-light">Total Revenue</div>
      </div>

      {/* Avg Booking Rate */}
      <div className={`${cardAlt} rounded-3xl p-6 border ${borderClass}`}>
        <Phone className="w-8 h-8 mb-3 text-orange-500" />
        <div className={`text-4xl font-semibold tracking-tight mb-1 ${textClass}`}>
          {avgBookingRate.toFixed(1)}%
        </div>
        <div className={`${textSecondary} text-sm font-light`}>Avg Booking Rate</div>
      </div>

      {/* Avg Conversion Rate */}
      <div className={`${cardAlt} rounded-3xl p-6 border ${borderClass}`}>
        <CheckCircle className="w-8 h-8 mb-3 text-orange-500" />
        <div className={`text-4xl font-semibold tracking-tight mb-1 ${textClass}`}>
          {avgConversionRate.toFixed(1)}%
        </div>
        <div className={`${textSecondary} text-sm font-light`}>Avg Conversion Rate</div>
      </div>

      {/* Total Closed Deals */}
      <div className={`${cardAlt} rounded-3xl p-6 border ${borderClass}`}>
        <Target className="w-8 h-8 mb-3 text-orange-500" />
        <div className={`text-4xl font-semibold tracking-tight mb-1 ${textClass}`}>
          {totalClosed}
        </div>
        <div className={`${textSecondary} text-sm font-light`}>Total Closed Deals</div>
      </div>
    </div>
  );
}
